/**
 * Created by Doron Tal on 03/03/14.
 */


function bidi() {

    /* @type {number} @const */ this.CL_NONE = 0x0000;
    /* @type {number} @const */ this.CL_ROMAN = 0x0001;
    /* @type {number} @const */ this.CL_ME = 0x0002;
    /* @type {number} @const */ this.CL_NUMBER = 0x0008;
    /* @type {number} @const */ this.CL_SIGNS = 0x0010;
    /* @type {number} @const */ this.CL_NUM_CONTINUE = 0x0020;
    /* @type {number} @const */ this.CL_NUM_PREFIX = 0x0040;
    /* @type {number} @const */ this.CL_HEBREW_NEXT=0x0080;
    /* @type {number} @const */ this.CL_ARABIC_NEXT=0x0100;
    /* @type {number} @const */ this.CL_ROMAN_NEXT=0x0200;
    /* @type {number} @const */ this.CL_NUMBER_NEXT=0x0400;


    /* @type {string} @const */ this.ROMAN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    /* @type {string} @const */ this.NUM_PERFIX = "#$%";

    /* @type {string} @const */ this.NUM_CONTINUE_SIGNS = "#$%-+";
    /* @type {string} @const */ this.NUM_NOT_CONTINUE_SIGNS = ":./,";
}

bidi.prototype.NextChar = function(str, nFrom, nStrLen, nDefaultLan, nLastCL, nStrLen2) {
    /* @type {number} */ var i = 0;
    /* @type {number} */ var cl = this.CL_NONE;
    /* @type {number} */ var clNext = this.CL_NONE;

    i = nFrom;

    while (i < nStrLen && cl === this.CL_NONE)
    {
        if ( (str[i] >= 'A' && str[i] <= 'Z') || (str[i] >= 'a' && str[i] <= 'z') )
            cl = this.CL_ROMAN;

        if ( (str[i] >= '0' && str[i] <= '9') )
            cl = this.CL_NUMBER;

        if ( (str[i] >= 0x0590 && str[i] <= 0x05FF) )
            cl = this.CL_ME;

        if ( (str[i] >= 0x0600 && str[i] <= 0x06FF) || (str[i] >= 0xFB50 && str[i] <= 0xFDFF) || (str[i] >= 0xFE70 && str[i] <= 0xFEFF) )
            cl = this.CL_ME;


        if ((nLastCL & this.CL_NUMBER) != this.CL_NUMBER && this.OneOf(str[i], this.NUM_PERFIX)) {
            cl = this.CL_NUMBER;
        } else {
            if ((nLastCL & this.CL_NUMBER) === this.CL_NUMBER) {
                if (this.OneOf(str[i], this.NUM_CONTINUE_SIGNS)) {
                    cl = this.CL_NUMBER;
                } else {
                    if (this.OneOf(str[i], this.NUM_NOT_CONTINUE_SIGNS)) {
                        if (i+1 < nStrLen2 && ( (str[i+1] >= '0' && str[i+1] <= '9'))) {
                            cl = this.CL_NUMBER;
                        }
                    }
                }
            }
        }

        i++;
    }

    if  (cl === this.CL_NUMBER) {

        while (i < nStrLen2 && ( (str[i] >= '0' && str[i] <= '9') || this.OneOf(str[i], this.NUM_PERFIX) ) )
            i++;

        if ( (str[i] >= 'A' && str[i] <= 'Z') || (str[i] >= 'a' && str[i] <= 'z') )
            cl = this.CL_ROMAN;
    }


    if (cl === this.CL_NONE)
        cl = nDefaultLan;

    return cl;
};

bidi.prototype.OneOf = function(ch, chars)
{
    var nStrLen = chars.length;
    var	i;

    i = 0;
    while (i < nStrLen)
    {
        if (ch === chars[i])
            return true;
        i++;
    }

    return false;
};

bidi.prototype.LtrToRtl = function(str, nStrLen, nDefaultLen) {

    if (str.length === 0)
        return "";

    var  i,j,k, startNum, endNum, wordTmpLen;
    var strTmp = "";
    var wordTmp = "";
    var chTmp = '';
    var cl, clNum;

    i = 0;
    k = nStrLen-1;
    while (k > 0 && str[k] == '\0')
        k--;

    if (str[i] == 0xFEFF)
    {
        strTmp[i] = str[i];
        i++;
    }

    cl = nDefaultLen;
    cl = this.NextChar(str,i,i+1,nDefaultLen,cl,nStrLen);
    if (cl == this.CL_NUMBER)
        cl = nDefaultLen;


    while (i < nStrLen)
    {
        if ((cl & this.CL_ME) === this.CL_ME)
        {
            while (i < nStrLen && cl !== this.CL_ROMAN)
            {
                chTmp = str.charAt(i);
                switch (chTmp)
                {
                    case '(':
                        chTmp = ')';
                        break;
                    case ')':
                        chTmp = '(';
                        break;
                    case '{':
                        chTmp = '}';
                        break;
                    case '}':
                        chTmp = '{';
                        break;
                    case '[':
                        chTmp = ']';
                        break;
                    case ']':
                        chTmp = '[';
                        break;

                }
                wordTmp += chTmp;
                i++;
                cl = this.NextChar(str, i, i+1, nDefaultLen, cl, nStrLen);
            }

            wordTmpLen = wordTmp.length;

            j=0;

            startNum = -1;
            endNum = -1;

            j=0;

            while (j < wordTmpLen)
            {
                clNum = nDefaultLen;
                clNum = this.NextChar(wordTmp, j, j+1, nDefaultLen, clNum, wordTmpLen);
                if ((clNum & this.CL_NUMBER) === this.CL_NUMBER)
                {
                    startNum = j;
                    endNum = startNum;

                    while (endNum < wordTmpLen && (clNum & this.CL_NUMBER) === this.CL_NUMBER)
                    {
                        endNum++;
                        clNum = this.NextChar(wordTmp, endNum, endNum+1, nDefaultLen, clNum, wordTmpLen);
                    }

                    endNum--;

                    j = endNum;
                    while (j >= startNum)
                    {
                        strTmp = wordTmp.charAt(j) + strTmp;
                        j--;
                        k--;
                    }

                    j = endNum+1;
                }
                else
                {
                    strTmp = wordTmp.charAt(j) + strTmp;
                    j++;
                    k--;
                }
            }
            wordTmp = "";

        }
        else
        {
            j=0;
            while (i < nStrLen && !((cl & this.CL_ME) === this.CL_ME))
            {
                wordTmp += str.charAt(i);
                i++;
                j++;
                cl = this.NextChar(str, i, nStrLen, nDefaultLen, cl, nStrLen);
            }

            j--;

            while (j > -1)
            {
                strTmp = wordTmp.charAt(j) + strTmp;
                j--;
                k--;
            }

            wordTmp = "";
        }
    }

    return strTmp;
};
