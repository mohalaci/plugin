/**
 * Framework7 2.3.1
 * Full featured mobile HTML framework for building iOS & Android apps
 * http://framework7.io/
 *
 * Copyright 2014-2018 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: June 11, 2018
 */

import { window as window$1, document } from 'ssr-window';
import $ from 'dom7';
export { default as Dom7 } from 'dom7';
import Template7 from 'template7';
export { default as Template7 } from 'template7';
import PathToRegexp from 'path-to-regexp';

/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

/* eslint-disable */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

function binarySubdivide (aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
   var currentSlope = getSlope(aGuessT, mX1, mX2);
   if (currentSlope === 0.0) {
     return aGuessT;
   }
   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
   aGuessT -= currentX / currentSlope;
 }
 return aGuessT;
}

function bezier (mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  if (mX1 !== mY1 || mX2 !== mY2) {
    for (var i = 0; i < kSplineTableSize; ++i) {
      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  }

  function getTForX (aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing (x) {
    if (mX1 === mY1 && mX2 === mY2) {
      return x; // linear
    }
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
}

/* eslint no-control-regex: "off" */

// Remove Diacritics
const defaultDiacriticsRemovalap = [
  { base: 'A', letters: '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F' },
  { base: 'AA', letters: '\uA732' },
  { base: 'AE', letters: '\u00C6\u01FC\u01E2' },
  { base: 'AO', letters: '\uA734' },
  { base: 'AU', letters: '\uA736' },
  { base: 'AV', letters: '\uA738\uA73A' },
  { base: 'AY', letters: '\uA73C' },
  { base: 'B', letters: '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181' },
  { base: 'C', letters: '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E' },
  { base: 'D', letters: '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779' },
  { base: 'DZ', letters: '\u01F1\u01C4' },
  { base: 'Dz', letters: '\u01F2\u01C5' },
  { base: 'E', letters: '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E' },
  { base: 'F', letters: '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B' },
  { base: 'G', letters: '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E' },
  { base: 'H', letters: '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D' },
  { base: 'I', letters: '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197' },
  { base: 'J', letters: '\u004A\u24BF\uFF2A\u0134\u0248' },
  { base: 'K', letters: '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2' },
  { base: 'L', letters: '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780' },
  { base: 'LJ', letters: '\u01C7' },
  { base: 'Lj', letters: '\u01C8' },
  { base: 'M', letters: '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C' },
  { base: 'N', letters: '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4' },
  { base: 'NJ', letters: '\u01CA' },
  { base: 'Nj', letters: '\u01CB' },
  { base: 'O', letters: '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C' },
  { base: 'OI', letters: '\u01A2' },
  { base: 'OO', letters: '\uA74E' },
  { base: 'OU', letters: '\u0222' },
  { base: 'OE', letters: '\u008C\u0152' },
  { base: 'oe', letters: '\u009C\u0153' },
  { base: 'P', letters: '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754' },
  { base: 'Q', letters: '\u0051\u24C6\uFF31\uA756\uA758\u024A' },
  { base: 'R', letters: '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782' },
  { base: 'S', letters: '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784' },
  { base: 'T', letters: '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786' },
  { base: 'TZ', letters: '\uA728' },
  { base: 'U', letters: '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244' },
  { base: 'V', letters: '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245' },
  { base: 'VY', letters: '\uA760' },
  { base: 'W', letters: '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72' },
  { base: 'X', letters: '\u0058\u24CD\uFF38\u1E8A\u1E8C' },
  { base: 'Y', letters: '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE' },
  { base: 'Z', letters: '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762' },
  { base: 'a', letters: '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250' },
  { base: 'aa', letters: '\uA733' },
  { base: 'ae', letters: '\u00E6\u01FD\u01E3' },
  { base: 'ao', letters: '\uA735' },
  { base: 'au', letters: '\uA737' },
  { base: 'av', letters: '\uA739\uA73B' },
  { base: 'ay', letters: '\uA73D' },
  { base: 'b', letters: '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253' },
  { base: 'c', letters: '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184' },
  { base: 'd', letters: '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A' },
  { base: 'dz', letters: '\u01F3\u01C6' },
  { base: 'e', letters: '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD' },
  { base: 'f', letters: '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C' },
  { base: 'g', letters: '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F' },
  { base: 'h', letters: '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265' },
  { base: 'hv', letters: '\u0195' },
  { base: 'i', letters: '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131' },
  { base: 'j', letters: '\u006A\u24D9\uFF4A\u0135\u01F0\u0249' },
  { base: 'k', letters: '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3' },
  { base: 'l', letters: '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747' },
  { base: 'lj', letters: '\u01C9' },
  { base: 'm', letters: '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F' },
  { base: 'n', letters: '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5' },
  { base: 'nj', letters: '\u01CC' },
  { base: 'o', letters: '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275' },
  { base: 'oi', letters: '\u01A3' },
  { base: 'ou', letters: '\u0223' },
  { base: 'oo', letters: '\uA74F' },
  { base: 'p', letters: '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755' },
  { base: 'q', letters: '\u0071\u24E0\uFF51\u024B\uA757\uA759' },
  { base: 'r', letters: '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783' },
  { base: 's', letters: '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B' },
  { base: 't', letters: '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787' },
  { base: 'tz', letters: '\uA729' },
  { base: 'u', letters: '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289' },
  { base: 'v', letters: '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C' },
  { base: 'vy', letters: '\uA761' },
  { base: 'w', letters: '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73' },
  { base: 'x', letters: '\u0078\u24E7\uFF58\u1E8B\u1E8D' },
  { base: 'y', letters: '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF' },
  { base: 'z', letters: '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763' },
];

const diacriticsMap = {};
for (let i = 0; i < defaultDiacriticsRemovalap.length; i += 1) {
  const letters = defaultDiacriticsRemovalap[i].letters;
  for (let j = 0; j < letters.length; j += 1) {
    diacriticsMap[letters[j]] = defaultDiacriticsRemovalap[i].base;
  }
}

const createPromise = function createPromise(handler) {
  let resolved = false;
  let rejected = false;
  let resolveArgs;
  let rejectArgs;
  const promiseHandlers = {
    then: undefined,
    catch: undefined,
  };
  const promise = {
    then(thenHandler) {
      if (resolved) {
        thenHandler(...resolveArgs);
      } else {
        promiseHandlers.then = thenHandler;
      }
      return promise;
    },
    catch(catchHandler) {
      if (rejected) {
        catchHandler(...rejectArgs);
      } else {
        promiseHandlers.catch = catchHandler;
      }
      return promise;
    },
  };

  function resolve(...args) {
    resolved = true;
    if (promiseHandlers.then) promiseHandlers.then(...args);
    else resolveArgs = args;
  }
  function reject(...args) {
    rejected = true;
    if (promiseHandlers.catch) promiseHandlers.catch(...args);
    else rejectArgs = args;
  }
  handler(resolve, reject);

  return promise;
};

const Utils = {
  mdPreloaderContent: `
    <span class="preloader-inner">
      <span class="preloader-inner-gap"></span>
      <span class="preloader-inner-left">
          <span class="preloader-inner-half-circle"></span>
      </span>
      <span class="preloader-inner-right">
          <span class="preloader-inner-half-circle"></span>
      </span>
    </span>
  `.trim(),
  eventNameToColonCase(eventName) {
    let hasColon;
    return eventName.split('').map((char, index) => {
      if (char.match(/[A-Z]/) && index !== 0 && !hasColon) {
        hasColon = true;
        return `:${char.toLowerCase()}`;
      }
      return char.toLowerCase();
    }).join('');
  },
  deleteProps(obj) {
    const object = obj;
    Object.keys(object).forEach((key) => {
      try {
        object[key] = null;
      } catch (e) {
        // no getter for object
      }
      try {
        delete object[key];
      } catch (e) {
        // something got wrong
      }
    });
  },
  bezier(...args) {
    return bezier(...args);
  },
  nextTick(callback, delay = 0) {
    return setTimeout(callback, delay);
  },
  nextFrame(callback) {
    return Utils.requestAnimationFrame(callback);
  },
  now() {
    return Date.now();
  },
  promise(handler) {
    return window$1.Promise ? new Promise(handler) : createPromise(handler);
  },
  requestAnimationFrame(callback) {
    if (window$1.requestAnimationFrame) return window$1.requestAnimationFrame(callback);
    else if (window$1.webkitRequestAnimationFrame) return window$1.webkitRequestAnimationFrame(callback);
    return window$1.setTimeout(callback, 1000 / 60);
  },
  cancelAnimationFrame(id) {
    if (window$1.cancelAnimationFrame) return window$1.cancelAnimationFrame(id);
    else if (window$1.webkitCancelAnimationFrame) return window$1.webkitCancelAnimationFrame(id);
    return window$1.clearTimeout(id);
  },
  removeDiacritics(str) {
    return str.replace(/[^\u0000-\u007E]/g, a => diacriticsMap[a] || a);
  },
  parseUrlQuery(url) {
    const query = {};
    let urlToParse = url || window$1.location.href;
    let i;
    let params;
    let param;
    let length;
    if (typeof urlToParse === 'string' && urlToParse.length) {
      urlToParse = urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : '';
      params = urlToParse.split('&').filter(paramsPart => paramsPart !== '');
      length = params.length;

      for (i = 0; i < length; i += 1) {
        param = params[i].replace(/#\S+/g, '').split('=');
        query[decodeURIComponent(param[0])] = typeof param[1] === 'undefined' ? undefined : decodeURIComponent(param[1]) || '';
      }
    }
    return query;
  },
  getTranslate(el, axis = 'x') {
    let matrix;
    let curTransform;
    let transformMatrix;

    const curStyle = window$1.getComputedStyle(el, null);

    if (window$1.WebKitCSSMatrix) {
      curTransform = curStyle.transform || curStyle.webkitTransform;
      if (curTransform.split(',').length > 6) {
        curTransform = curTransform.split(', ').map(a => a.replace(',', '.')).join(', ');
      }
      // Some old versions of Webkit choke when 'none' is passed; pass
      // empty string instead in this case
      transformMatrix = new window$1.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
    } else {
      transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
      matrix = transformMatrix.toString().split(',');
    }

    if (axis === 'x') {
      // Latest Chrome and webkits Fix
      if (window$1.WebKitCSSMatrix) curTransform = transformMatrix.m41;
      // Crazy IE10 Matrix
      else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
      // Normal Browsers
      else curTransform = parseFloat(matrix[4]);
    }
    if (axis === 'y') {
      // Latest Chrome and webkits Fix
      if (window$1.WebKitCSSMatrix) curTransform = transformMatrix.m42;
      // Crazy IE10 Matrix
      else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
      // Normal Browsers
      else curTransform = parseFloat(matrix[5]);
    }
    return curTransform || 0;
  },
  serializeObject(obj, parents = []) {
    if (typeof obj === 'string') return obj;
    const resultArray = [];
    const separator = '&';
    let newParents;
    function varName(name) {
      if (parents.length > 0) {
        let parentParts = '';
        for (let j = 0; j < parents.length; j += 1) {
          if (j === 0) parentParts += parents[j];
          else parentParts += `[${encodeURIComponent(parents[j])}]`;
        }
        return `${parentParts}[${encodeURIComponent(name)}]`;
      }
      return encodeURIComponent(name);
    }
    function varValue(value) {
      return encodeURIComponent(value);
    }
    Object.keys(obj).forEach((prop) => {
      let toPush;
      if (Array.isArray(obj[prop])) {
        toPush = [];
        for (let i = 0; i < obj[prop].length; i += 1) {
          if (!Array.isArray(obj[prop][i]) && typeof obj[prop][i] === 'object') {
            newParents = parents.slice();
            newParents.push(prop);
            newParents.push(String(i));
            toPush.push(Utils.serializeObject(obj[prop][i], newParents));
          } else {
            toPush.push(`${varName(prop)}[]=${varValue(obj[prop][i])}`);
          }
        }
        if (toPush.length > 0) resultArray.push(toPush.join(separator));
      } else if (obj[prop] === null || obj[prop] === '') {
        resultArray.push(`${varName(prop)}=`);
      } else if (typeof obj[prop] === 'object') {
        // Object, convert to named array
        newParents = parents.slice();
        newParents.push(prop);
        toPush = Utils.serializeObject(obj[prop], newParents);
        if (toPush !== '') resultArray.push(toPush);
      } else if (typeof obj[prop] !== 'undefined' && obj[prop] !== '') {
        // Should be string or plain value
        resultArray.push(`${varName(prop)}=${varValue(obj[prop])}`);
      } else if (obj[prop] === '') resultArray.push(varName(prop));
    });
    return resultArray.join(separator);
  },
  isObject(o) {
    return typeof o === 'object' && o !== null && o.constructor && o.constructor === Object;
  },
  merge(...args) {
    const to = args[0];
    args.splice(0, 1);
    const from = args;

    for (let i = 0; i < from.length; i += 1) {
      const nextSource = args[i];
      if (nextSource !== undefined && nextSource !== null) {
        const keysArray = Object.keys(Object(nextSource));
        for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
          const nextKey = keysArray[nextIndex];
          const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  },
  extend(...args) {
    let deep = true;
    let to;
    let from;
    if (typeof args[0] === 'boolean') {
      deep = args[0];
      to = args[1];
      args.splice(0, 2);
      from = args;
    } else {
      to = args[0];
      args.splice(0, 1);
      from = args;
    }
    for (let i = 0; i < from.length; i += 1) {
      const nextSource = args[i];
      if (nextSource !== undefined && nextSource !== null) {
        const keysArray = Object.keys(Object(nextSource));
        for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
          const nextKey = keysArray[nextIndex];
          const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable) {
            if (!deep) {
              to[nextKey] = nextSource[nextKey];
            } else if (Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
              Utils.extend(to[nextKey], nextSource[nextKey]);
            } else if (!Utils.isObject(to[nextKey]) && Utils.isObject(nextSource[nextKey])) {
              to[nextKey] = {};
              Utils.extend(to[nextKey], nextSource[nextKey]);
            } else {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
    }
    return to;
  },
};

const Device = (function Device() {
  const ua = window$1.navigator.userAgent;

  const device = {
    ios: false,
    android: false,
    androidChrome: false,
    desktop: false,
    windows: false,
    iphone: false,
    iphoneX: false,
    ipod: false,
    ipad: false,
    cordova: window$1.cordova || window$1.phonegap,
    phonegap: window$1.cordova || window$1.phonegap,
  };

  const windows = ua.match(/(Windows Phone);?[\s\/]+([\d.]+)?/); // eslint-disable-line
  const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line
  const ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
  const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
  const iphoneX = iphone && window$1.screen.width === 375 && window$1.screen.height === 812;


  // Windows
  if (windows) {
    device.os = 'windows';
    device.osVersion = windows[2];
    device.windows = true;
  }
  // Android
  if (android && !windows) {
    device.os = 'android';
    device.osVersion = android[2];
    device.android = true;
    device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
  }
  if (ipad || iphone || ipod) {
    device.os = 'ios';
    device.ios = true;
  }
  // iOS
  if (iphone && !ipod) {
    device.osVersion = iphone[2].replace(/_/g, '.');
    device.iphone = true;
    device.iphoneX = iphoneX;
  }
  if (ipad) {
    device.osVersion = ipad[2].replace(/_/g, '.');
    device.ipad = true;
  }
  if (ipod) {
    device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
    device.iphone = true;
  }
  // iOS 8+ changed UA
  if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
    if (device.osVersion.split('.')[0] === '10') {
      device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
    }
  }

  // Webview
  device.webView = (iphone || ipad || ipod) && (ua.match(/.*AppleWebKit(?!.*Safari)/i) || window$1.navigator.standalone);
  device.webview = device.webView;


  // Desktop
  device.desktop = !(device.os || device.android || device.webView);

  // Minimal UI
  if (device.os && device.os === 'ios') {
    const osVersionArr = device.osVersion.split('.');
    const metaViewport = document.querySelector('meta[name="viewport"]');
    device.minimalUi =
      !device.webView &&
      (ipod || iphone) &&
      (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) &&
      metaViewport && metaViewport.getAttribute('content').indexOf('minimal-ui') >= 0;
  }

  // Check for status bar and fullscreen app mode
  device.needsStatusbarOverlay = function needsStatusbarOverlay() {
    if ((device.webView || (device.android && device.cordova)) && (window$1.innerWidth * window$1.innerHeight === window$1.screen.width * window$1.screen.height)) {
      if (device.iphoneX && (window$1.orientation === 90 || window$1.orientation === -90)) {
        return false;
      }
      return true;
    }
    return false;
  };
  device.statusbar = device.needsStatusbarOverlay();

  // Pixel Ratio
  device.pixelRatio = window$1.devicePixelRatio || 1;

  // Export object
  return device;
}());

class Framework7Class {
  constructor(params = {}, parents = []) {
    const self = this;
    self.params = params;

    // Events
    self.eventsParents = parents;
    self.eventsListeners = {};

    if (self.params && self.params.on) {
      Object.keys(self.params.on).forEach((eventName) => {
        self.on(eventName, self.params.on[eventName]);
      });
    }
  }
  on(events, handler, priority) {
    const self = this;
    if (typeof handler !== 'function') return self;
    const method = priority ? 'unshift' : 'push';
    events.split(' ').forEach((event) => {
      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
      self.eventsListeners[event][method](handler);
    });
    return self;
  }
  once(events, handler, priority) {
    const self = this;
    if (typeof handler !== 'function') return self;
    function onceHandler(...args) {
      handler.apply(self, args);
      self.off(events, onceHandler);
    }
    return self.on(events, onceHandler, priority);
  }
  off(events, handler) {
    const self = this;
    if (!self.eventsListeners) return self;
    events.split(' ').forEach((event) => {
      if (typeof handler === 'undefined') {
        self.eventsListeners[event] = [];
      } else {
        self.eventsListeners[event].forEach((eventHandler, index) => {
          if (eventHandler === handler) {
            self.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self;
  }
  emit(...args) {
    const self = this;
    if (!self.eventsListeners) return self;
    let events;
    let data;
    let context;
    let eventsParents;
    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
      events = args[0];
      data = args.slice(1, args.length);
      context = self;
      eventsParents = self.eventsParents;
    } else {
      events = args[0].events;
      data = args[0].data;
      context = args[0].context || self;
      eventsParents = args[0].local ? [] : args[0].parents || self.eventsParents;
    }
    const eventsArray = Array.isArray(events) ? events : events.split(' ');
    const localEvents = eventsArray.map(eventName => eventName.replace('local::', ''));
    const parentEvents = eventsArray.filter(eventName => eventName.indexOf('local::') < 0);

    localEvents.forEach((event) => {
      if (self.eventsListeners && self.eventsListeners[event]) {
        const handlers = [];
        self.eventsListeners[event].forEach((eventHandler) => {
          handlers.push(eventHandler);
        });
        handlers.forEach((eventHandler) => {
          eventHandler.apply(context, data);
        });
      }
    });
    if (eventsParents && eventsParents.length > 0) {
      eventsParents.forEach((eventsParent) => {
        eventsParent.emit(parentEvents, ...data);
      });
    }
    return self;
  }
  useModulesParams(instanceParams) {
    const instance = this;
    if (!instance.modules) return;
    Object.keys(instance.modules).forEach((moduleName) => {
      const module = instance.modules[moduleName];
      // Extend params
      if (module.params) {
        Utils.extend(instanceParams, module.params);
      }
    });
  }
  useModules(modulesParams = {}) {
    const instance = this;
    if (!instance.modules) return;
    Object.keys(instance.modules).forEach((moduleName) => {
      const module = instance.modules[moduleName];
      const moduleParams = modulesParams[moduleName] || {};
      // Extend instance methods and props
      if (module.instance) {
        Object.keys(module.instance).forEach((modulePropName) => {
          const moduleProp = module.instance[modulePropName];
          if (typeof moduleProp === 'function') {
            instance[modulePropName] = moduleProp.bind(instance);
          } else {
            instance[modulePropName] = moduleProp;
          }
        });
      }
      // Add event listeners
      if (module.on && instance.on) {
        Object.keys(module.on).forEach((moduleEventName) => {
          instance.on(moduleEventName, module.on[moduleEventName]);
        });
      }

      // Module create callback
      if (module.create) {
        module.create.bind(instance)(moduleParams);
      }
    });
  }
  static set components(components) {
    const Class = this;
    if (!Class.use) return;
    Class.use(components);
  }
  static installModule(module, ...params) {
    const Class = this;
    if (!Class.prototype.modules) Class.prototype.modules = {};
    const name = module.name || (`${Object.keys(Class.prototype.modules).length}_${Utils.now()}`);
    Class.prototype.modules[name] = module;
    // Prototype
    if (module.proto) {
      Object.keys(module.proto).forEach((key) => {
        Class.prototype[key] = module.proto[key];
      });
    }
    // Class
    if (module.static) {
      Object.keys(module.static).forEach((key) => {
        Class[key] = module.static[key];
      });
    }
    // Callback
    if (module.install) {
      module.install.apply(Class, params);
    }
    return Class;
  }
  static use(module, ...params) {
    const Class = this;
    if (Array.isArray(module)) {
      module.forEach(m => Class.installModule(m));
      return Class;
    }
    return Class.installModule(module, ...params);
  }
}

class Framework7 extends Framework7Class {
  constructor(params) {
    super(params);

    const passedParams = Utils.extend({}, params);

    // App Instance
    const app = this;

    // Default
    const defaults = {
      version: '1.0.0',
      id: 'io.framework7.testapp',
      root: 'body',
      theme: 'auto',
      language: window$1.navigator.language,
      routes: [],
      name: 'Framework7',
      initOnDeviceReady: true,
      init: true,
    };

    // Extend defaults with modules params
    app.useModulesParams(defaults);


    // Extend defaults with passed params
    app.params = Utils.extend(defaults, params);

    const $rootEl = $(app.params.root);

    Utils.extend(app, {
      // App Id
      id: app.params.id,
      // App Name
      name: app.params.name,
      // App version
      version: app.params.version,
      // Routes
      routes: app.params.routes,
      // Lang
      language: app.params.language,
      // Root
      root: $rootEl,
      // RTL
      rtl: $rootEl.css('direction') === 'rtl',
      // Theme
      theme: (function getTheme() {
        if (app.params.theme === 'auto') {
          return Device.ios ? 'ios' : 'md';
        }
        return app.params.theme;
      }()),
      // Initially passed parameters
      passedParams,
    });

    // Save Root
    if (app.root && app.root[0]) {
      app.root[0].f7 = app;
    }

    // Install Modules
    app.useModules();

    // Init
    if (app.params.init) {
      if (Device.cordova && app.params.initOnDeviceReady) {
        $(document).on('deviceready', () => {
          app.init();
        });
      } else {
        app.init();
      }
    }

    // Return app instance
    return app;
  }
  init() {
    const app = this;
    if (app.initialized) return;

    app.root.addClass('framework7-initializing');

    // RTL attr
    if (app.rtl) {
      $('html').attr('dir', 'rtl');
    }

    // Root class
    app.root.addClass('framework7-root');

    // Theme class
    $('html').removeClass('ios md').addClass(app.theme);

    // Data
    app.data = {};
    if (app.params.data && typeof app.params.data === 'function') {
      Utils.extend(app.data, app.params.data.bind(app)());
    } else if (app.params.data) {
      Utils.extend(app.data, app.params.data);
    }
    // Methods
    app.methods = {};
    if (app.params.methods) {
      Utils.extend(app.methods, app.params.methods);
    }
    // Init class
    Utils.nextFrame(() => {
      app.root.removeClass('framework7-initializing');
    });
    // Emit, init other modules
    app.initialized = true;
    app.emit('init');
  }
  // eslint-disable-next-line
  get $() {
    return $;
  }
  // eslint-disable-next-line
  get t7() {
    return Template7;
  }
  static get Dom7() {
    return $;
  }
  static get $() {
    return $;
  }
  static get Template7() {
    return Template7;
  }
  static get Class() {
    return Framework7Class;
  }
}

const globals = {};
let jsonpRequests = 0;

function Request(requestOptions) {
  const globalsNoCallbacks = Utils.extend({}, globals);
  ('beforeCreate beforeOpen beforeSend error complete success statusCode').split(' ').forEach((callbackName) => {
    delete globalsNoCallbacks[callbackName];
  });
  const defaults = Utils.extend({
    url: window$1.location.toString(),
    method: 'GET',
    data: false,
    async: true,
    cache: true,
    user: '',
    password: '',
    headers: {},
    xhrFields: {},
    statusCode: {},
    processData: true,
    dataType: 'text',
    contentType: 'application/x-www-form-urlencoded',
    timeout: 0,
  }, globalsNoCallbacks);

  const options = Utils.extend({}, defaults, requestOptions);
  let proceedRequest;

  // Function to run XHR callbacks and events
  function fireCallback(callbackName, ...data) {
    /*
      Callbacks:
      beforeCreate (options),
      beforeOpen (xhr, options),
      beforeSend (xhr, options),
      error (xhr, status),
      complete (xhr, stautus),
      success (response, status, xhr),
      statusCode ()
    */
    let globalCallbackValue;
    let optionCallbackValue;
    if (globals[callbackName]) {
      globalCallbackValue = globals[callbackName](...data);
    }
    if (options[callbackName]) {
      optionCallbackValue = options[callbackName](...data);
    }
    if (typeof globalCallbackValue !== 'boolean') globalCallbackValue = true;
    if (typeof optionCallbackValue !== 'boolean') optionCallbackValue = true;
    return (globalCallbackValue && optionCallbackValue);
  }

  // Before create callback
  proceedRequest = fireCallback('beforeCreate', options);
  if (proceedRequest === false) return undefined;

  // For jQuery guys
  if (options.type) options.method = options.type;

  // Parameters Prefix
  let paramsPrefix = options.url.indexOf('?') >= 0 ? '&' : '?';

  // UC method
  const method = options.method.toUpperCase();

  // Data to modify GET URL
  if ((method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'DELETE') && options.data) {
    let stringData;
    if (typeof options.data === 'string') {
      // Should be key=value string
      if (options.data.indexOf('?') >= 0) stringData = options.data.split('?')[1];
      else stringData = options.data;
    } else {
      // Should be key=value object
      stringData = Utils.serializeObject(options.data);
    }
    if (stringData.length) {
      options.url += paramsPrefix + stringData;
      if (paramsPrefix === '?') paramsPrefix = '&';
    }
  }

  // JSONP
  if (options.dataType === 'json' && options.url.indexOf('callback=') >= 0) {
    const callbackName = `f7jsonp_${Date.now() + ((jsonpRequests += 1))}`;
    let abortTimeout;
    const callbackSplit = options.url.split('callback=');
    let requestUrl = `${callbackSplit[0]}callback=${callbackName}`;
    if (callbackSplit[1].indexOf('&') >= 0) {
      const addVars = callbackSplit[1].split('&').filter(el => el.indexOf('=') > 0).join('&');
      if (addVars.length > 0) requestUrl += `&${addVars}`;
    }

    // Create script
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.onerror = function onerror() {
      clearTimeout(abortTimeout);
      fireCallback('error', null, 'scripterror');
      fireCallback('complete', null, 'scripterror');
    };
    script.src = requestUrl;

    // Handler
    window$1[callbackName] = function jsonpCallback(data) {
      clearTimeout(abortTimeout);
      fireCallback('success', data);
      script.parentNode.removeChild(script);
      script = null;
      delete window$1[callbackName];
    };
    document.querySelector('head').appendChild(script);

    if (options.timeout > 0) {
      abortTimeout = setTimeout(() => {
        script.parentNode.removeChild(script);
        script = null;
        fireCallback('error', null, 'timeout');
      }, options.timeout);
    }

    return undefined;
  }

  // Cache for GET/HEAD requests
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS' || method === 'DELETE') {
    if (options.cache === false) {
      options.url += `${paramsPrefix}_nocache${Date.now()}`;
    }
  }

  // Create XHR
  const xhr = new XMLHttpRequest();

  // Save Request URL
  xhr.requestUrl = options.url;
  xhr.requestParameters = options;

  // Before open callback
  proceedRequest = fireCallback('beforeOpen', xhr, options);
  if (proceedRequest === false) return xhr;

  // Open XHR
  xhr.open(method, options.url, options.async, options.user, options.password);

  // Create POST Data
  let postData = null;

  if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && options.data) {
    if (options.processData) {
      const postDataInstances = [ArrayBuffer, Blob, Document, FormData];
      // Post Data
      if (postDataInstances.indexOf(options.data.constructor) >= 0) {
        postData = options.data;
      } else {
        // POST Headers
        const boundary = `---------------------------${Date.now().toString(16)}`;

        if (options.contentType === 'multipart/form-data') {
          xhr.setRequestHeader('Content-Type', `multipart/form-data; boundary=${boundary}`);
        } else {
          xhr.setRequestHeader('Content-Type', options.contentType);
        }
        postData = '';
        let data = Utils.serializeObject(options.data);
        if (options.contentType === 'multipart/form-data') {
          data = data.split('&');
          const newData = [];
          for (let i = 0; i < data.length; i += 1) {
            newData.push(`Content-Disposition: form-data; name="${data[i].split('=')[0]}"\r\n\r\n${data[i].split('=')[1]}\r\n`);
          }
          postData = `--${boundary}\r\n${newData.join(`--${boundary}\r\n`)}--${boundary}--\r\n`;
        } else {
          postData = data;
        }
      }
    } else {
      postData = options.data;
      xhr.setRequestHeader('Content-Type', options.contentType);
    }
  }

  // Additional headers
  if (options.headers) {
    Object.keys(options.headers).forEach((headerName) => {
      xhr.setRequestHeader(headerName, options.headers[headerName]);
    });
  }

  // Check for crossDomain
  if (typeof options.crossDomain === 'undefined') {
    // eslint-disable-next-line
    options.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(options.url) && RegExp.$2 !== window$1.location.host;
  }

  if (!options.crossDomain) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  }

  if (options.xhrFields) {
    Utils.extend(xhr, options.xhrFields);
  }

  let xhrTimeout;

  // Handle XHR
  xhr.onload = function onload() {
    if (xhrTimeout) clearTimeout(xhrTimeout);
    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
      let responseData;
      if (options.dataType === 'json') {
        let parseError;
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch (err) {
          parseError = true;
        }
        if (!parseError) {
          fireCallback('success', responseData, xhr.status, xhr);
        } else {
          fireCallback('error', xhr, 'parseerror');
        }
      } else {
        responseData = xhr.responseType === 'text' || xhr.responseType === '' ? xhr.responseText : xhr.response;
        fireCallback('success', responseData, xhr.status, xhr);
      }
    } else {
      fireCallback('error', xhr, xhr.status);
    }
    if (options.statusCode) {
      if (globals.statusCode && globals.statusCode[xhr.status]) globals.statusCode[xhr.status](xhr);
      if (options.statusCode[xhr.status]) options.statusCode[xhr.status](xhr);
    }
    fireCallback('complete', xhr, xhr.status);
  };

  xhr.onerror = function onerror() {
    if (xhrTimeout) clearTimeout(xhrTimeout);
    fireCallback('error', xhr, xhr.status);
    fireCallback('complete', xhr, 'error');
  };

  // Timeout
  if (options.timeout > 0) {
    xhr.onabort = function onabort() {
      if (xhrTimeout) clearTimeout(xhrTimeout);
    };
    xhrTimeout = setTimeout(() => {
      xhr.abort();
      fireCallback('error', xhr, 'timeout');
      fireCallback('complete', xhr, 'timeout');
    }, options.timeout);
  }

  // Ajax start callback
  proceedRequest = fireCallback('beforeSend', xhr, options);
  if (proceedRequest === false) return xhr;

  // Send XHR
  xhr.send(postData);

  // Return XHR object
  return xhr;
}
function RequestShortcut(method, ...args) {
  let [url, data, success, error, dataType] = [];
  if (typeof args[1] === 'function') {
    [url, success, error, dataType] = args;
  } else {
    [url, data, success, error, dataType] = args;
  }
  [success, error].forEach((callback) => {
    if (typeof callback === 'string') {
      dataType = callback;
      if (callback === success) success = undefined;
      else error = undefined;
    }
  });
  dataType = dataType || (method === 'json' || method === 'postJSON' ? 'json' : undefined);
  const requestOptions = {
    url,
    method: method === 'post' || method === 'postJSON' ? 'POST' : 'GET',
    data,
    success,
    error,
    dataType,
  };
  if (method === 'postJSON') {
    Utils.extend(requestOptions, {
      contentType: 'application/json',
      processData: false,
      crossDomain: true,
      data: typeof data === 'string' ? data : JSON.stringify(data),
    });
  }
  return Request(requestOptions);
}
Request.get = function get(...args) {
  return RequestShortcut('get', ...args);
};
Request.post = function post(...args) {
  return RequestShortcut('post', ...args);
};
Request.json = function json(...args) {
  return RequestShortcut('json', ...args);
};
Request.getJSON = Request.json;
Request.postJSON = function postJSON(...args) {
  return RequestShortcut('postJSON', ...args);
};
Request.setup = function setup(options) {
  if (options.type && !options.method) {
    Utils.extend(options, { method: options.type });
  }
  Utils.extend(globals, options);
};

const Support = (function Support() {
  const positionSticky = (function supportPositionSticky() {
    let support = false;
    const div = document.createElement('div');
    ('sticky -webkit-sticky -moz-sticky').split(' ').forEach((prop) => {
      if (support) return;
      div.style.position = prop;
      if (div.style.position === prop) {
        support = true;
      }
    });
    return support;
  }());

  const testDiv = document.createElement('div');

  return {
    positionSticky,
    touch: (function checkTouch() {
      return !!(('ontouchstart' in window$1) || (window$1.DocumentTouch && document instanceof window$1.DocumentTouch));
    }()),

    pointerEvents: !!(window$1.navigator.pointerEnabled || window$1.PointerEvent),
    prefixedPointerEvents: !!window$1.navigator.msPointerEnabled,

    transition: (function checkTransition() {
      const style = testDiv.style;
      return ('transition' in style || 'webkitTransition' in style || 'MozTransition' in style);
    }()),
    transforms3d: (window$1.Modernizr && window$1.Modernizr.csstransforms3d === true) || (function checkTransforms3d() {
      const style = testDiv.style;
      return ('webkitPerspective' in style || 'MozPerspective' in style || 'OPerspective' in style || 'MsPerspective' in style || 'perspective' in style);
    }()),

    flexbox: (function checkFlexbox() {
      const div = document.createElement('div').style;
      const styles = ('alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient').split(' ');
      for (let i = 0; i < styles.length; i += 1) {
        if (styles[i] in div) return true;
      }
      return false;
    }()),

    observer: (function checkObserver() {
      return ('MutationObserver' in window$1 || 'WebkitMutationObserver' in window$1);
    }()),

    passiveListener: (function checkPassiveListener() {
      let supportsPassive = false;
      try {
        const opts = Object.defineProperty({}, 'passive', {
          // eslint-disable-next-line
          get() {
            supportsPassive = true;
          },
        });
        window$1.addEventListener('testPassiveListener', null, opts);
      } catch (e) {
        // No support
      }
      return supportsPassive;
    }()),

    gestures: (function checkGestures() {
      return 'ongesturestart' in window$1;
    }()),
  };
}());

var DeviceModule = {
  name: 'device',
  proto: {
    device: Device,
  },
  static: {
    device: Device,
  },
  on: {
    init() {
      const classNames = [];
      const html = document.querySelector('html');
      if (!html) return;
      // Pixel Ratio
      classNames.push(`device-pixel-ratio-${Math.floor(Device.pixelRatio)}`);
      if (Device.pixelRatio >= 2) {
        classNames.push('device-retina');
      }
      // OS classes
      if (Device.os) {
        classNames.push(
          `device-${Device.os}`,
          `device-${Device.os}-${Device.osVersion.split('.')[0]}`,
          `device-${Device.os}-${Device.osVersion.replace(/\./g, '-')}`
        );
        if (Device.os === 'ios') {
          const major = parseInt(Device.osVersion.split('.')[0], 10);
          for (let i = major - 1; i >= 6; i -= 1) {
            classNames.push(`device-ios-gt-${i}`);
          }
          if (Device.iphoneX) {
            classNames.push('device-iphone-x');
          }
        }
      } else if (Device.desktop) {
        classNames.push('device-desktop');
      }
      if (Device.cordova || Device.phonegap) {
        classNames.push('device-cordova');
      }

      // Add html classes
      classNames.forEach((className) => {
        html.classList.add(className);
      });
    },
  },
};

var SupportModule = {
  name: 'support',
  proto: {
    support: Support,
  },
  static: {
    support: Support,
  },
  on: {
    init() {
      const html = document.querySelector('html');
      if (!html) return;
      const classNames = [];
      if (Support.positionSticky) {
        classNames.push('support-position-sticky');
      }
      // Add html classes
      classNames.forEach((className) => {
        html.classList.add(className);
      });
    },
  },
};

var UtilsModule = {
  name: 'utils',
  proto: {
    utils: Utils,
  },
  static: {
    utils: Utils,
  },
};

var ResizeModule = {
  name: 'resize',
  instance: {
    getSize() {
      const app = this;
      if (!app.root[0]) return { width: 0, height: 0, left: 0, top: 0 };
      const offset = app.root.offset();
      const [width, height, left, top] = [app.root[0].offsetWidth, app.root[0].offsetHeight, offset.left, offset.top];
      app.width = width;
      app.height = height;
      app.left = left;
      app.top = top;
      return { width, height, left, top };
    },
  },
  on: {
    init() {
      const app = this;

      // Get Size
      app.getSize();

      // Emit resize
      window$1.addEventListener('resize', () => {
        app.emit('resize');
      }, false);

      // Emit orientationchange
      window$1.addEventListener('orientationchange', () => {
        app.emit('orientationchange');
      });
    },
    orientationchange() {
      const app = this;
      if (app.device && app.device.minimalUi) {
        if (window$1.orientation === 90 || window$1.orientation === -90) {
          document.body.scrollTop = 0;
        }
      }
      // Fix iPad weird body scroll
      if (app.device.ipad) {
        document.body.scrollLeft = 0;
        setTimeout(() => {
          document.body.scrollLeft = 0;
        }, 0);
      }
    },
    resize() {
      const app = this;
      app.getSize();
    },
  },
};

/* eslint no-param-reassign: "off" */

var RequestModule = {
  name: 'request',
  proto: {
    request: Request,
  },
  static: {
    request: Request,
  },
};

function initTouch() {
  const app = this;
  const params = app.params.touch;
  const useRipple = app.theme === 'md' && params.materialRipple;

  if (Device.ios && Device.webView) {
    // Strange hack required for iOS 8 webview to work on inputs
    window$1.addEventListener('touchstart', () => {});
  }

  let touchStartX;
  let touchStartY;
  let touchStartTime;
  let targetElement;
  let trackClick;
  let activeSelection;
  let scrollParent;
  let lastClickTime;
  let isMoved;
  let tapHoldFired;
  let tapHoldTimeout;

  let activableElement;
  let activeTimeout;

  let needsFastClick;
  let needsFastClickTimeOut;

  let rippleWave;
  let rippleTarget;
  let rippleTimeout;

  function findActivableElement(el) {
    const target = $(el);
    const parents = target.parents(params.activeStateElements);
    let activable;
    if (target.is(params.activeStateElements)) {
      activable = target;
    }
    if (parents.length > 0) {
      activable = activable ? activable.add(parents) : parents;
    }
    return activable || target;
  }

  function isInsideScrollableView(el) {
    const pageContent = el.parents('.page-content, .panel');

    if (pageContent.length === 0) {
      return false;
    }

    // This event handler covers the "tap to stop scrolling".
    if (pageContent.prop('scrollHandlerSet') !== 'yes') {
      pageContent.on('scroll', () => {
        clearTimeout(activeTimeout);
        clearTimeout(rippleTimeout);
      });
      pageContent.prop('scrollHandlerSet', 'yes');
    }

    return true;
  }
  function addActive() {
    if (!activableElement) return;
    activableElement.addClass('active-state');
  }
  function removeActive() {
    if (!activableElement) return;
    activableElement.removeClass('active-state');
    activableElement = null;
  }
  function isFormElement(el) {
    const nodes = ('input select textarea label').split(' ');
    if (el.nodeName && nodes.indexOf(el.nodeName.toLowerCase()) >= 0) return true;
    return false;
  }
  function androidNeedsBlur(el) {
    const noBlur = ('button input textarea select').split(' ');
    if (document.activeElement && el !== document.activeElement && document.activeElement !== document.body) {
      if (noBlur.indexOf(el.nodeName.toLowerCase()) >= 0) {
        return false;
      }
      return true;
    }
    return false;
  }
  function targetNeedsFastClick(el) {
    /*
    if (
      Device.ios
      &&
      (
        Device.osVersion.split('.')[0] > 9
        ||
        (Device.osVersion.split('.')[0] * 1 === 9 && Device.osVersion.split('.')[1] >= 1)
      )
    ) {
      return false;
    }
    */
    const $el = $(el);
    if (el.nodeName.toLowerCase() === 'input' && (el.type === 'file' || el.type === 'range')) return false;
    if (el.nodeName.toLowerCase() === 'select' && Device.android) return false;
    if ($el.hasClass('no-fastclick') || $el.parents('.no-fastclick').length > 0) return false;
    if (params.fastClicksExclude && $el.is(params.fastClicksExclude)) return false;
    return true;
  }
  function targetNeedsFocus(el) {
    if (document.activeElement === el) {
      return false;
    }
    const tag = el.nodeName.toLowerCase();
    const skipInputs = ('button checkbox file image radio submit').split(' ');
    if (el.disabled || el.readOnly) return false;
    if (tag === 'textarea') return true;
    if (tag === 'select') {
      if (Device.android) return false;
      return true;
    }
    if (tag === 'input' && skipInputs.indexOf(el.type) < 0) return true;
    return false;
  }
  function targetNeedsPrevent(el) {
    const $el = $(el);
    let prevent = true;
    if ($el.is('label') || $el.parents('label').length > 0) {
      if (Device.android) {
        prevent = false;
      } else if (Device.ios && $el.is('input')) {
        prevent = true;
      } else prevent = false;
    }
    return prevent;
  }

  // Ripple handlers
  function findRippleElement(el) {
    const rippleElements = params.materialRippleElements;
    const $el = $(el);
    if ($el.is(rippleElements)) {
      if ($el.hasClass('no-ripple')) {
        return false;
      }
      return $el;
    } else if ($el.parents(rippleElements).length > 0) {
      const rippleParent = $el.parents(rippleElements).eq(0);
      if (rippleParent.hasClass('no-ripple')) {
        return false;
      }
      return rippleParent;
    }
    return false;
  }
  function createRipple($el, x, y) {
    if (!$el) return;
    rippleWave = app.touchRipple.create($el, x, y);
  }

  function removeRipple() {
    if (!rippleWave) return;
    rippleWave.remove();
    rippleWave = undefined;
    rippleTarget = undefined;
  }
  function rippleTouchStart(el) {
    rippleTarget = findRippleElement(el);
    if (!rippleTarget || rippleTarget.length === 0) {
      rippleTarget = undefined;
      return;
    }
    if (!isInsideScrollableView(rippleTarget)) {
      createRipple(rippleTarget, touchStartX, touchStartY);
    } else {
      rippleTimeout = setTimeout(() => {
        createRipple(rippleTarget, touchStartX, touchStartY);
      }, 80);
    }
  }
  function rippleTouchMove() {
    clearTimeout(rippleTimeout);
    removeRipple();
  }
  function rippleTouchEnd() {
    if (rippleWave) {
      removeRipple();
    } else if (rippleTarget && !isMoved) {
      clearTimeout(rippleTimeout);
      createRipple(rippleTarget, touchStartX, touchStartY);
      setTimeout(removeRipple, 0);
    } else {
      removeRipple();
    }
  }

  // Mouse Handlers
  function handleMouseDown(e) {
    findActivableElement(e.target).addClass('active-state');
    if ('which' in e && e.which === 3) {
      setTimeout(() => {
        $('.active-state').removeClass('active-state');
      }, 0);
    }
    if (useRipple) {
      touchStartX = e.pageX;
      touchStartY = e.pageY;
      rippleTouchStart(e.target, e.pageX, e.pageY);
    }
  }
  function handleMouseMove() {
    $('.active-state').removeClass('active-state');
    if (useRipple) {
      rippleTouchMove();
    }
  }
  function handleMouseUp() {
    $('.active-state').removeClass('active-state');
    if (useRipple) {
      rippleTouchEnd();
    }
  }

  // Send Click
  function sendClick(e) {
    const touch = e.changedTouches[0];
    const evt = document.createEvent('MouseEvents');
    let eventType = 'click';
    if (Device.android && targetElement.nodeName.toLowerCase() === 'select') {
      eventType = 'mousedown';
    }
    evt.initMouseEvent(eventType, true, true, window$1, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
    evt.forwardedTouchEvent = true;

    if (app.device.ios && window$1.navigator.standalone) {
      // Fix the issue happens in iOS home screen apps where the wrong element is selected during a momentum scroll.
      // Upon tapping, we give the scrolling time to stop, then we grab the element based where the user tapped.
      setTimeout(() => {
        targetElement = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        targetElement.dispatchEvent(evt);
      }, 10);
    } else {
      targetElement.dispatchEvent(evt);
    }
  }

  // Touch Handlers
  function handleTouchStart(e) {
    isMoved = false;
    tapHoldFired = false;
    if (e.targetTouches.length > 1) {
      if (activableElement) removeActive();
      return true;
    }
    if (e.touches.length > 1 && activableElement) {
      removeActive();
    }
    if (params.tapHold) {
      if (tapHoldTimeout) clearTimeout(tapHoldTimeout);
      tapHoldTimeout = setTimeout(() => {
        if (e && e.touches && e.touches.length > 1) return;
        tapHoldFired = true;
        e.preventDefault();
        $(e.target).trigger('taphold');
      }, params.tapHoldDelay);
    }
    if (needsFastClickTimeOut) clearTimeout(needsFastClickTimeOut);
    needsFastClick = targetNeedsFastClick(e.target);

    if (!needsFastClick) {
      trackClick = false;
      return true;
    }
    if (Device.ios || (Device.android && 'getSelection' in window$1)) {
      const selection = window$1.getSelection();
      if (
        selection.rangeCount &&
        selection.focusNode !== document.body &&
        (!selection.isCollapsed || document.activeElement === selection.focusNode)
      ) {
        activeSelection = true;
        return true;
      }

      activeSelection = false;
    }
    if (Device.android) {
      if (androidNeedsBlur(e.target)) {
        document.activeElement.blur();
      }
    }

    trackClick = true;
    targetElement = e.target;
    touchStartTime = (new Date()).getTime();
    touchStartX = e.targetTouches[0].pageX;
    touchStartY = e.targetTouches[0].pageY;

    // Detect scroll parent
    if (Device.ios) {
      scrollParent = undefined;
      $(targetElement).parents().each(() => {
        const parent = this;
        if (parent.scrollHeight > parent.offsetHeight && !scrollParent) {
          scrollParent = parent;
          scrollParent.f7ScrollTop = scrollParent.scrollTop;
        }
      });
    }
    if ((touchStartTime - lastClickTime) < params.fastClicksDelayBetweenClicks) {
      e.preventDefault();
    }

    if (params.activeState) {
      activableElement = findActivableElement(targetElement);
      // If it's inside a scrollable view, we don't trigger active-state yet,
      // because it can be a scroll instead. Based on the link:
      // http://labnote.beedesk.com/click-scroll-and-pseudo-active-on-mobile-webk
      if (!isInsideScrollableView(activableElement)) {
        addActive();
      } else {
        activeTimeout = setTimeout(addActive, 80);
      }
    }
    if (useRipple) {
      rippleTouchStart(targetElement, touchStartX, touchStartY);
    }
    return true;
  }
  function handleTouchMove(e) {
    if (!trackClick) return;
    const distance = params.fastClicksDistanceThreshold;
    if (distance) {
      const pageX = e.targetTouches[0].pageX;
      const pageY = e.targetTouches[0].pageY;
      if (Math.abs(pageX - touchStartX) > distance || Math.abs(pageY - touchStartY) > distance) {
        isMoved = true;
      }
    } else {
      isMoved = true;
    }
    if (isMoved) {
      trackClick = false;
      targetElement = null;
      isMoved = true;
      if (params.tapHold) {
        clearTimeout(tapHoldTimeout);
      }
      if (params.activeState) {
        clearTimeout(activeTimeout);
        removeActive();
      }
      if (useRipple) {
        rippleTouchMove();
      }
    }
  }
  function handleTouchEnd(e) {
    clearTimeout(activeTimeout);
    clearTimeout(tapHoldTimeout);

    const touchEndTime = (new Date()).getTime();

    if (!trackClick) {
      if (!activeSelection && needsFastClick) {
        if (!(Device.android && !e.cancelable) && e.cancelable) {
          e.preventDefault();
        }
      }
      return true;
    }

    if (document.activeElement === e.target) {
      if (params.activeState) removeActive();
      if (useRipple) {
        rippleTouchEnd();
      }
      return true;
    }

    if (!activeSelection) {
      e.preventDefault();
    }

    if ((touchEndTime - lastClickTime) < params.fastClicksDelayBetweenClicks) {
      setTimeout(removeActive, 0);
      return true;
    }

    lastClickTime = touchEndTime;

    trackClick = false;

    if (Device.ios && scrollParent) {
      if (scrollParent.scrollTop !== scrollParent.f7ScrollTop) {
        return false;
      }
    }

    // Add active-state here because, in a very fast tap, the timeout didn't
    // have the chance to execute. Removing active-state in a timeout gives
    // the chance to the animation execute.
    if (params.activeState) {
      addActive();
      setTimeout(removeActive, 0);
    }
    // Remove Ripple
    if (useRipple) {
      rippleTouchEnd();
    }

    // Trigger focus when required
    if (targetNeedsFocus(targetElement)) {
      if (Device.ios && Device.webView) {
        targetElement.focus();
        return false;
      }

      targetElement.focus();
    }

    // Blur active elements
    if (document.activeElement && targetElement !== document.activeElement && document.activeElement !== document.body && targetElement.nodeName.toLowerCase() !== 'label') {
      document.activeElement.blur();
    }

    // Send click
    e.preventDefault();
    if (params.tapHoldPreventClicks && tapHoldFired) {
      return false;
    }
    sendClick(e);
    return false;
  }
  function handleTouchCancel() {
    trackClick = false;
    targetElement = null;

    // Remove Active State
    clearTimeout(activeTimeout);
    clearTimeout(tapHoldTimeout);
    if (params.activeState) {
      removeActive();
    }

    // Remove Ripple
    if (useRipple) {
      rippleTouchEnd();
    }
  }

  function handleClick(e) {
    let allowClick = false;
    if (trackClick) {
      targetElement = null;
      trackClick = false;
      return true;
    }
    if ((e.target.type === 'submit' && e.detail === 0) || e.target.type === 'file') {
      return true;
    }
    if (!targetElement) {
      if (!isFormElement(e.target)) {
        allowClick = true;
      }
    }
    if (!needsFastClick) {
      allowClick = true;
    }
    if (document.activeElement === targetElement) {
      allowClick = true;
    }
    if (e.forwardedTouchEvent) {
      allowClick = true;
    }
    if (!e.cancelable) {
      allowClick = true;
    }
    if (params.tapHold && params.tapHoldPreventClicks && tapHoldFired) {
      allowClick = false;
    }
    if (!allowClick) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      if (targetElement) {
        if (targetNeedsPrevent(targetElement) || isMoved) {
          e.preventDefault();
        }
      } else {
        e.preventDefault();
      }
      targetElement = null;
    }
    needsFastClickTimeOut = setTimeout(() => {
      needsFastClick = false;
    }, (Device.ios || Device.androidChrome ? 100 : 400));

    if (params.tapHold) {
      tapHoldTimeout = setTimeout(() => {
        tapHoldFired = false;
      }, (Device.ios || Device.androidChrome ? 100 : 400));
    }

    return allowClick;
  }

  function emitAppTouchEvent(name, e) {
    app.emit({
      events: name,
      data: [e],
    });
  }
  function appClick(e) {
    emitAppTouchEvent('click', e);
  }
  function appTouchStartActive(e) {
    emitAppTouchEvent('touchstart touchstart:active', e);
  }
  function appTouchMoveActive(e) {
    emitAppTouchEvent('touchmove touchmove:active', e);
  }
  function appTouchEndActive(e) {
    emitAppTouchEvent('touchend touchend:active', e);
  }
  function appTouchStartPassive(e) {
    emitAppTouchEvent('touchstart:passive', e);
  }
  function appTouchMovePassive(e) {
    emitAppTouchEvent('touchmove:passive', e);
  }
  function appTouchEndPassive(e) {
    emitAppTouchEvent('touchend:passive', e);
  }

  const passiveListener = Support.passiveListener ? { passive: true } : false;
  const activeListener = Support.passiveListener ? { passive: false } : false;

  document.addEventListener('click', appClick, true);

  if (Support.passiveListener) {
    document.addEventListener(app.touchEvents.start, appTouchStartActive, activeListener);
    document.addEventListener(app.touchEvents.move, appTouchMoveActive, activeListener);
    document.addEventListener(app.touchEvents.end, appTouchEndActive, activeListener);

    document.addEventListener(app.touchEvents.start, appTouchStartPassive, passiveListener);
    document.addEventListener(app.touchEvents.move, appTouchMovePassive, passiveListener);
    document.addEventListener(app.touchEvents.end, appTouchEndPassive, passiveListener);
  } else {
    document.addEventListener(app.touchEvents.start, (e) => {
      appTouchStartActive(e);
      appTouchStartPassive(e);
    }, false);
    document.addEventListener(app.touchEvents.move, (e) => {
      appTouchMoveActive(e);
      appTouchMovePassive(e);
    }, false);
    document.addEventListener(app.touchEvents.end, (e) => {
      appTouchEndActive(e);
      appTouchEndPassive(e);
    }, false);
  }

  if (Support.touch) {
    app.on('click', handleClick);
    app.on('touchstart', handleTouchStart);
    app.on('touchmove', handleTouchMove);
    app.on('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });
  } else if (params.activeState) {
    app.on('touchstart', handleMouseDown);
    app.on('touchmove', handleMouseMove);
    app.on('touchend', handleMouseUp);
  }
  document.addEventListener('contextmenu', (e) => {
    if (params.disableContextMenu && (Device.ios || Device.android || Device.cordova)) {
      e.preventDefault();
    }
    if (useRipple) {
      if (activableElement) removeActive();
      rippleTouchEnd();
    }
  });
}

var TouchModule = {
  name: 'touch',
  params: {
    touch: {
      // Fast clicks
      fastClicks: true,
      fastClicksDistanceThreshold: 10,
      fastClicksDelayBetweenClicks: 50,
      fastClicksExclude: '', // CSS selector
      // ContextMenu
      disableContextMenu: true,
      // Tap Hold
      tapHold: false,
      tapHoldDelay: 750,
      tapHoldPreventClicks: true,
      // Active State
      activeState: true,
      activeStateElements: 'a, button, label, span, .actions-button, .stepper-button, .stepper-button-plus, .stepper-button-minus',
      materialRipple: true,
      materialRippleElements: '.ripple, .link, .item-link, .links-list a, .button, button, .input-clear-button, .dialog-button, .tab-link, .item-radio, .item-checkbox, .actions-button, .searchbar-disable-button, .fab a, .checkbox, .radio, .data-table .sortable-cell:not(.input-cell), .notification-close-button, .stepper-button, .stepper-button-minus, .stepper-button-plus',
    },
  },
  instance: {
    touchEvents: {
      start: Support.touch ? 'touchstart' : 'mousedown',
      move: Support.touch ? 'touchmove' : 'mousemove',
      end: Support.touch ? 'touchend' : 'mouseup',
    },
  },
  on: {
    init: initTouch,
  },
};

const tempDom = document.createElement('div');

class Framework7Component {
  constructor(opts, extendContext = {}) {
    const options = Utils.extend({}, opts);
    let component = Utils.merge(this, extendContext, { $options: options });

    // Apply context
    ('beforeCreate created beforeMount mounted beforeDestroy destroyed').split(' ').forEach((cycleKey) => {
      if (options[cycleKey]) options[cycleKey] = options[cycleKey].bind(component);
    });

    if (options.data) {
      options.data = options.data.bind(component);
      // Data
      Utils.extend(component, options.data());
    }
    if (options.render) options.render = options.render.bind(component);
    if (options.methods) {
      Object.keys(options.methods).forEach((methodName) => {
        component[methodName] = options.methods[methodName].bind(component);
      });
    }

    // Bind Events
    if (options.on) {
      Object.keys(options.on).forEach((eventName) => {
        options.on[eventName] = options.on[eventName].bind(component);
      });
    }
    if (options.once) {
      Object.keys(options.once).forEach((eventName) => {
        options.once[eventName] = options.once[eventName].bind(component);
      });
    }

    if (options.beforeCreate) options.beforeCreate();

    // Watchers
    if (options.watch) {
      Object.keys(options.watch).forEach((watchKey) => {
        let dataKeyValue = component[watchKey];
        Object.defineProperty(component, watchKey, {
          enumerable: true,
          configurable: true,
          set(newValue) {
            const previousValue = dataKeyValue;
            dataKeyValue = newValue;
            if (previousValue === newValue) return;
            options.watch[watchKey].call(component, newValue, previousValue);
          },
          get() {
            return dataKeyValue;
          },
        });
      });
    }

    // Render template

    function render() {
      let html = '';
      if (options.render) {
        html = options.render();
      } else if (options.template) {
        if (typeof options.template === 'string') {
          try {
            html = Template7.compile(options.template)(component);
          } catch (err) {
            throw err;
          }
        } else {
          // Supposed to be function
          html = options.template(component);
        }
      }
      return html;
    }

    let html = render();

    // Make Dom
    if (html && typeof html === 'string') {
      html = html.trim();
      tempDom.innerHTML = html;
    } else if (html) {
      tempDom.innerHTML = '';
      tempDom.appendChild(html);
    }

    // Extend component with $el
    const el = tempDom.children[0];
    const $el = $(el);
    component.$el = $el;
    component.el = el;
    component.el = el;

    // Find Events
    const events = [];
    $(tempDom).find('*').each((index, element) => {
      const attrs = [];
      for (let i = 0; i < element.attributes.length; i += 1) {
        const attr = element.attributes[i];
        if (attr.name.indexOf('@') === 0) {
          attrs.push({
            name: attr.name,
            value: attr.value,
          });
        }
      }
      attrs.forEach((attr) => {
        element.removeAttribute(attr.name);
        const event = attr.name.replace('@', '');
        let name = event;
        let stop = false;
        let prevent = false;
        let once = false;
        if (event.indexOf('.') >= 0) {
          event.split('.').forEach((eventNamePart, eventNameIndex) => {
            if (eventNameIndex === 0) name = eventNamePart;
            else {
              if (eventNamePart === 'stop') stop = true;
              if (eventNamePart === 'prevent') prevent = true;
              if (eventNamePart === 'once') once = true;
            }
          });
        }
        const value = attr.value.toString();
        events.push({
          el: element,
          name,
          once,
          handler(...args) {
            const e = args[0];
            if (stop) e.stopPropagation();
            if (prevent) e.preventDefault();
            let methodName;
            let method;
            let customArgs = [];
            if (value.indexOf('(') < 0) {
              customArgs = args;
              methodName = value;
            } else {
              methodName = value.split('(')[0];
              value.split('(')[1].split(')')[0].split(',').forEach((argument) => {
                let arg = argument.trim();
                // eslint-disable-next-line
                if (!isNaN(arg)) arg = parseFloat(arg);
                else if (arg === 'true') arg = true;
                else if (arg === 'false') arg = false;
                else if (arg === 'null') arg = null;
                else if (arg === 'undefined') arg = undefined;
                else if (arg[0] === '"') arg = arg.replace(/"/g, '');
                else if (arg[0] === '\'') arg = arg.replace(/'/g, '');
                else if (arg.indexOf('.') > 0) {
                  let deepArg;
                  arg.split('.').forEach((path) => {
                    if (!deepArg) deepArg = component;
                    deepArg = deepArg[path];
                  });
                  arg = deepArg;
                } else {
                  arg = component[arg];
                }
                customArgs.push(arg);
              });
            }
            if (methodName.indexOf('.') >= 0) {
              methodName.split('.').forEach((path, pathIndex) => {
                if (!method) method = component;
                if (method[path]) method = method[path];
                else {
                  throw new Error(`Component doesn't have method "${methodName.split('.').slice(0, pathIndex + 1).join('.')}"`);
                }
              });
            } else {
              if (!component[methodName]) {
                throw new Error(`Component doesn't have method "${methodName}"`);
              }
              method = component[methodName];
            }
            method(...customArgs);
          },
        });
      });
    });

    // Set styles scope ID
    let styleEl;
    if (options.style) {
      styleEl = document.createElement('style');
      styleEl.innerHTML = options.style;
    }
    if (options.styleScopeId) {
      el.setAttribute('data-scope', options.styleScopeId);
    }

    // Attach events
    function attachEvents() {
      if (options.on) {
        Object.keys(options.on).forEach((eventName) => {
          $el.on(Utils.eventNameToColonCase(eventName), options.on[eventName]);
        });
      }
      if (options.once) {
        Object.keys(options.once).forEach((eventName) => {
          $el.once(Utils.eventNameToColonCase(eventName), options.once[eventName]);
        });
      }
      events.forEach((event) => {
        $(event.el)[event.once ? 'once' : 'on'](event.name, event.handler);
      });
    }

    function detachEvents() {
      if (options.on) {
        Object.keys(options.on).forEach((eventName) => {
          $el.off(Utils.eventNameToColonCase(eventName), options.on[eventName]);
        });
      }
      if (options.once) {
        Object.keys(options.once).forEach((eventName) => {
          $el.off(Utils.eventNameToColonCase(eventName), options.once[eventName]);
        });
      }
      events.forEach((event) => {
        $(event.el).off(event.name, event.handler);
      });
    }

    attachEvents();

    // Created callback
    if (options.created) options.created();

    // Mount
    component.$mount = function mount(mountMethod) {
      if (options.beforeMount) options.beforeMount();
      if (styleEl) $('head').append(styleEl);
      if (mountMethod) mountMethod(el);
      if (options.mounted) options.mounted();
    };

    // Destroy
    component.$destroy = function destroy() {
      if (options.beforeDestroy) options.beforeDestroy();
      if (styleEl) $(styleEl).remove();
      detachEvents();
      if (options.destroyed) options.destroyed();
      // Delete component instance
      if (el && el.f7Component) {
        el.f7Component = null;
        delete el.f7Component;
      }
      Utils.deleteProps(component);
      component = null;
    };

    // Store component instance
    for (let i = 0; i < tempDom.children.length; i += 1) {
      tempDom.children[i].f7Component = component;
    }

    return component;
  }
}


const Component = {
  parse(componentString) {
    const callbackName = `f7_component_callback_${new Date().getTime()}`;

    // Template
    let template;
    if (componentString.indexOf('<template>') >= 0) {
      template = componentString
        .split('<template>')
        .filter((item, index) => index > 0)
        .join('<template>')
        .split('</template>')
        .filter((item, index, arr) => index < arr.length - 1)
        .join('</template>')
        .replace(/{{#raw}}([ \n]*)<template/g, '{{#raw}}<template')
        .replace(/\/template>([ \n]*){{\/raw}}/g, '/template>{{/raw}}')
        .replace(/([ \n])<template/g, '$1{{#raw}}<template')
        .replace(/\/template>([ \n])/g, '/template>{{/raw}}$1');
    }

    // Styles
    let style;
    const styleScopeId = Utils.now();
    if (componentString.indexOf('<style>') >= 0) {
      style = componentString.split('<style>')[1].split('</style>')[0];
    } else if (componentString.indexOf('<style scoped>') >= 0) {
      style = componentString.split('<style scoped>')[1].split('</style>')[0];
      style = style.split('\n').map((line) => {
        if (line.indexOf('{') >= 0) {
          if (line.indexOf('{{this}}') >= 0) {
            return line.replace('{{this}}', `[data-scope="${styleScopeId}"]`);
          }
          return `[data-scope="${styleScopeId}"] ${line.trim()}`;
        }
        return line;
      }).join('\n');
    }

    let scriptContent;
    if (componentString.indexOf('<script>') >= 0) {
      const scripts = componentString.split('<script>');
      scriptContent = scripts[scripts.length - 1].split('</script>')[0].trim();
    } else {
      scriptContent = 'return {}';
    }
    scriptContent = `window.${callbackName} = function () {${scriptContent}}`;

    // Insert Script El
    const scriptEl = document.createElement('script');
    scriptEl.innerHTML = scriptContent;
    $('head').append(scriptEl);

    const component = window$1[callbackName]();

    // Remove Script El
    $(scriptEl).remove();

    if (!component.template && !component.render) {
      component.template = template;
    }
    if (style) {
      component.style = style;
      component.styleScopeId = styleScopeId;
    }
    return component;
  },
  create(c, extendContext = {}) {
    return new Framework7Component(c, extendContext);
  },
};

const History = {
  queue: [],
  clearQueue() {
    if (History.queue.length === 0) return;
    const currentQueue = History.queue.shift();
    currentQueue();
  },
  routerQueue: [],
  clearRouterQueue() {
    if (History.routerQueue.length === 0) return;
    const currentQueue = History.routerQueue.pop();
    const { router, stateUrl, action } = currentQueue;

    let animate = router.params.animate;
    if (router.params.pushStateAnimate === false) animate = false;

    if (action === 'back') {
      router.back({ animate, pushState: false });
    }
    if (action === 'load') {
      router.navigate(stateUrl, { animate, pushState: false });
    }
  },
  handle(e) {
    if (History.blockPopstate) return;
    const app = this;
    // const mainView = app.views.main;
    let state = e.state;
    History.previousState = History.state;
    History.state = state;

    History.allowChange = true;
    History.clearQueue();

    state = History.state;
    if (!state) state = {};

    app.views.forEach((view) => {
      const router = view.router;
      let viewState = state[view.id];
      if (!viewState && view.params.pushState) {
        viewState = {
          url: view.router.history[0],
        };
      }
      if (!viewState) return;
      const stateUrl = viewState.url || undefined;

      let animate = router.params.animate;
      if (router.params.pushStateAnimate === false) animate = false;

      if (stateUrl !== router.url) {
        if (router.history.indexOf(stateUrl) >= 0) {
          // Go Back
          if (router.allowPageChange) {
            router.back({ animate, pushState: false });
          } else {
            History.routerQueue.push({
              action: 'back',
              router,
            });
          }
        } else if (router.allowPageChange) {
          // Load page
          router.navigate(stateUrl, { animate, pushState: false });
        } else {
          History.routerQueue.unshift({
            action: 'load',
            stateUrl,
            router,
          });
        }
      }
    });
  },
  initViewState(viewId, viewState) {
    const newState = Utils.extend({}, (History.state || {}), {
      [viewId]: viewState,
    });
    History.state = newState;
    window$1.history.replaceState(newState, '');
  },
  push(viewId, viewState, url) {
    if (!History.allowChange) {
      History.queue.push(() => {
        History.push(viewId, viewState, url);
      });
      return;
    }
    History.previousState = History.state;
    const newState = Utils.extend({}, (History.previousState || {}), {
      [viewId]: viewState,
    });
    History.state = newState;
    window$1.history.pushState(newState, '', url);
  },
  replace(viewId, viewState, url) {
    if (!History.allowChange) {
      History.queue.push(() => {
        History.replace(viewId, viewState, url);
      });
      return;
    }
    History.previousState = History.state;
    const newState = Utils.extend({}, (History.previousState || {}), {
      [viewId]: viewState,
    });
    History.state = newState;
    window$1.history.replaceState(newState, '', url);
  },
  go(index) {
    History.allowChange = false;
    window$1.history.go(index);
  },
  back() {
    History.allowChange = false;
    window$1.history.back();
  },
  allowChange: true,
  previousState: {},
  state: window$1.history.state,
  blockPopstate: true,
  init(app) {
    $(window$1).on('load', () => {
      setTimeout(() => {
        History.blockPopstate = false;
      }, 0);
    });

    if (document.readyState && document.readyState === 'complete') {
      History.blockPopstate = false;
    }

    $(window$1).on('popstate', History.handle.bind(app));
  },
};

function SwipeBack(r) {
  const router = r;
  const { $el, $navbarEl, app, params } = router;
  let isTouched = false;
  let isMoved = false;
  const touchesStart = {};
  let isScrolling;
  let currentPage = [];
  let previousPage = [];
  let viewContainerWidth;
  let touchesDiff;
  let allowViewTouchMove = true;
  let touchStartTime;
  let currentNavbar = [];
  let previousNavbar = [];
  let currentNavElements;
  let previousNavElements;
  let activeNavBackIcon;
  let activeNavBackIconText;
  let previousNavBackIcon;
  // let previousNavBackIconText;
  let dynamicNavbar;
  let separateNavbar;
  let pageShadow;
  let pageOpacity;
  let navbarWidth;

  const paramsSwipeBackAnimateShadow = params[`${app.theme}SwipeBackAnimateShadow`];
  const paramsSwipeBackAnimateOpacity = params[`${app.theme}SwipeBackAnimateOpacity`];
  const paramsSwipeBackActiveArea = params[`${app.theme}SwipeBackActiveArea`];
  const paramsSwipeBackThreshold = params[`${app.theme}SwipeBackThreshold`];

  function handleTouchStart(e) {
    const swipeBackEnabled = params[`${app.theme}SwipeBack`];
    if (!allowViewTouchMove || !swipeBackEnabled || isTouched || (app.swipeout && app.swipeout.el) || !router.allowPageChange) return;
    if ($(e.target).closest('.range-slider, .calendar-months').length > 0) return;
    isMoved = false;
    isTouched = true;
    isScrolling = undefined;
    touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
    touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
    touchStartTime = Utils.now();
    dynamicNavbar = router.dynamicNavbar;
    separateNavbar = router.separateNavbar;
  }
  function handleTouchMove(e) {
    if (!isTouched) return;
    const pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
    const pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
    if (typeof isScrolling === 'undefined') {
      isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x)) || pageX < touchesStart.x;
    }
    if (isScrolling || e.f7PreventSwipeBack || app.preventSwipeBack) {
      isTouched = false;
      return;
    }
    if (!isMoved) {
      // Calc values during first move fired
      let cancel = false;
      const target = $(e.target);

      const swipeout = target.closest('.swipeout');
      if (swipeout.length > 0) {
        if (!app.rtl && swipeout.find('.swipeout-actions-left').length > 0) cancel = true;
        if (app.rtl && swipeout.find('.swipeout-actions-right').length > 0) cancel = true;
      }

      currentPage = target.closest('.page');
      if (currentPage.hasClass('no-swipeback') || target.closest('.no-swipeback').length > 0) cancel = true;
      previousPage = $el.find('.page-previous:not(.stacked)');

      let notFromBorder = touchesStart.x - $el.offset().left > paramsSwipeBackActiveArea;
      viewContainerWidth = $el.width();
      if (app.rtl) {
        notFromBorder = touchesStart.x < ($el.offset().left - $el[0].scrollLeft) + (viewContainerWidth - paramsSwipeBackActiveArea);
      } else {
        notFromBorder = touchesStart.x - $el.offset().left > paramsSwipeBackActiveArea;
      }
      if (notFromBorder) cancel = true;
      if (previousPage.length === 0 || currentPage.length === 0) cancel = true;
      if (cancel) {
        isTouched = false;
        return;
      }

      if (paramsSwipeBackAnimateShadow) {
        pageShadow = currentPage.find('.page-shadow-effect');
        if (pageShadow.length === 0) {
          pageShadow = $('<div class="page-shadow-effect"></div>');
          currentPage.append(pageShadow);
        }
      }
      if (paramsSwipeBackAnimateOpacity) {
        pageOpacity = previousPage.find('.page-opacity-effect');
        if (pageOpacity.length === 0) {
          pageOpacity = $('<div class="page-opacity-effect"></div>');
          previousPage.append(pageOpacity);
        }
      }

      if (dynamicNavbar) {
        if (separateNavbar) {
          currentNavbar = $navbarEl.find('.navbar-current:not(.stacked)');
          previousNavbar = $navbarEl.find('.navbar-previous:not(.stacked)');
        } else {
          currentNavbar = currentPage.children('.navbar').children('.navbar-inner');
          previousNavbar = previousPage.children('.navbar').children('.navbar-inner');
        }
        navbarWidth = $navbarEl[0].offsetWidth;
        currentNavElements = currentNavbar.children('.left, .title, .right, .subnavbar, .fading');
        previousNavElements = previousNavbar.children('.left, .title, .right, .subnavbar, .fading');
        if (params.iosAnimateNavbarBackIcon) {
          if (currentNavbar.hasClass('sliding')) {
            activeNavBackIcon = currentNavbar.children('.left').find('.back .icon');
            activeNavBackIconText = currentNavbar.children('.left').find('.back span').eq(0);
          } else {
            activeNavBackIcon = currentNavbar.children('.left.sliding').find('.back .icon');
            activeNavBackIconText = currentNavbar.children('.left.sliding').find('.back span').eq(0);
          }
          if (previousNavbar.hasClass('sliding')) {
            previousNavBackIcon = previousNavbar.children('.left').find('.back .icon');
            // previousNavBackIconText = previousNavbar.children('left').find('.back span').eq(0);
          } else {
            previousNavBackIcon = previousNavbar.children('.left.sliding').find('.back .icon');
            // previousNavBackIconText = previousNavbar.children('.left.sliding').find('.back span').eq(0);
          }
        }
      }

      // Close/Hide Any Picker
      if ($('.sheet.modal-in').length > 0 && app.sheet) {
        app.sheet.close($('.sheet.modal-in'));
      }
    }
    e.f7PreventPanelSwipe = true;
    isMoved = true;
    app.preventSwipePanelBySwipeBack = true;
    e.preventDefault();

    // RTL inverter
    const inverter = app.rtl ? -1 : 1;

    // Touches diff
    touchesDiff = (pageX - touchesStart.x - paramsSwipeBackThreshold) * inverter;
    if (touchesDiff < 0) touchesDiff = 0;
    const percentage = touchesDiff / viewContainerWidth;

    // Swipe Back Callback
    const callbackData = {
      percentage,
      currentPageEl: currentPage[0],
      previousPageEl: previousPage[0],
      currentNavbarEl: currentNavbar[0],
      previousNavbarEl: previousNavbar[0],
    };
    $el.trigger('swipeback:move', callbackData);
    router.emit('swipebackMove', callbackData);

    // Transform pages
    let currentPageTranslate = touchesDiff * inverter;
    let previousPageTranslate = ((touchesDiff / 5) - (viewContainerWidth / 5)) * inverter;
    if (Device.pixelRatio === 1) {
      currentPageTranslate = Math.round(currentPageTranslate);
      previousPageTranslate = Math.round(previousPageTranslate);
    }

    currentPage.transform(`translate3d(${currentPageTranslate}px,0,0)`);
    if (paramsSwipeBackAnimateShadow) pageShadow[0].style.opacity = 1 - (1 * percentage);

    if (app.theme !== 'md') {
      previousPage.transform(`translate3d(${previousPageTranslate}px,0,0)`);
    }
    if (paramsSwipeBackAnimateOpacity) pageOpacity[0].style.opacity = 1 - (1 * percentage);

    // Dynamic Navbars Animation
    if (dynamicNavbar) {
      currentNavElements.each((index, navEl) => {
        const $navEl = $(navEl);
        if (!$navEl.is('.subnavbar')) $navEl[0].style.opacity = (1 - (percentage ** 0.33));
        if ($navEl[0].className.indexOf('sliding') >= 0 || currentNavbar.hasClass('sliding')) {
          let activeNavTranslate = percentage * $navEl[0].f7NavbarRightOffset;
          if (Device.pixelRatio === 1) activeNavTranslate = Math.round(activeNavTranslate);
          $navEl.transform(`translate3d(${activeNavTranslate}px,0,0)`);
          if (params.iosAnimateNavbarBackIcon) {
            if ($navEl[0].className.indexOf('left') >= 0 && activeNavBackIcon.length > 0) {
              let iconTranslate = -activeNavTranslate;
              if (!separateNavbar) {
                iconTranslate -= navbarWidth * percentage;
              }
              activeNavBackIcon.transform(`translate3d(${iconTranslate}px,0,0)`);
            }
          }
        }
      });
      previousNavElements.each((index, navEl) => {
        const $navEl = $(navEl);
        if (!$navEl.is('.subnavbar')) $navEl[0].style.opacity = (percentage ** 3);
        if ($navEl[0].className.indexOf('sliding') >= 0 || previousNavbar.hasClass('sliding')) {
          let previousNavTranslate = $navEl[0].f7NavbarLeftOffset * (1 - percentage);
          if ($navEl[0].className.indexOf('title') >= 0 && activeNavBackIcon && activeNavBackIcon.length && activeNavBackIconText.length) {
            previousNavTranslate = ($navEl[0].f7NavbarLeftOffset + activeNavBackIconText[0].offsetLeft) * (1 - percentage);
          } else {
            previousNavTranslate = $navEl[0].f7NavbarLeftOffset * (1 - percentage);
          }
          if (Device.pixelRatio === 1) previousNavTranslate = Math.round(previousNavTranslate);
          $navEl.transform(`translate3d(${previousNavTranslate}px,0,0)`);
          if (params.iosAnimateNavbarBackIcon) {
            if ($navEl[0].className.indexOf('left') >= 0 && previousNavBackIcon.length > 0) {
              let iconTranslate = -previousNavTranslate;
              if (!separateNavbar) {
                iconTranslate += (navbarWidth / 5) * (1 - percentage);
              }
              previousNavBackIcon.transform(`translate3d(${iconTranslate}px,0,0)`);
            }
          }
        }
      });
    }
  }
  function handleTouchEnd() {
    app.preventSwipePanelBySwipeBack = false;
    if (!isTouched || !isMoved) {
      isTouched = false;
      isMoved = false;
      return;
    }
    isTouched = false;
    isMoved = false;
    if (touchesDiff === 0) {
      $([currentPage[0], previousPage[0]]).transform('');
      if (pageShadow && pageShadow.length > 0) pageShadow.remove();
      if (pageOpacity && pageOpacity.length > 0) pageOpacity.remove();
      if (dynamicNavbar) {
        currentNavElements.transform('').css({ opacity: '' });
        previousNavElements.transform('').css({ opacity: '' });
        if (activeNavBackIcon && activeNavBackIcon.length > 0) activeNavBackIcon.transform('');
        if (previousNavBackIcon && activeNavBackIcon.length > 0) previousNavBackIcon.transform('');
      }
      return;
    }
    const timeDiff = Utils.now() - touchStartTime;
    let pageChanged = false;
    // Swipe back to previous page
    if (
      (timeDiff < 300 && touchesDiff > 10) ||
      (timeDiff >= 300 && touchesDiff > viewContainerWidth / 2)
    ) {
      currentPage.removeClass('page-current').addClass(`page-next${app.theme === 'md' ? ' page-next-on-right' : ''}`);
      previousPage.removeClass('page-previous').addClass('page-current').removeAttr('aria-hidden');
      if (pageShadow) pageShadow[0].style.opacity = '';
      if (pageOpacity) pageOpacity[0].style.opacity = '';
      if (dynamicNavbar) {
        currentNavbar.removeClass('navbar-current').addClass('navbar-next');
        previousNavbar.removeClass('navbar-previous').addClass('navbar-current').removeAttr('aria-hidden');
      }
      pageChanged = true;
    }
    // Reset custom styles
    // Add transitioning class for transition-duration
    $([currentPage[0], previousPage[0]]).addClass('page-transitioning page-transitioning-swipeback').transform('');

    if (dynamicNavbar) {
      currentNavElements.css({ opacity: '' })
        .each((navElIndex, navEl) => {
          const translate = pageChanged ? navEl.f7NavbarRightOffset : 0;
          const sliding = $(navEl);
          let iconTranslate = pageChanged ? -translate : 0;
          if (!separateNavbar && pageChanged) iconTranslate -= navbarWidth;
          sliding.transform(`translate3d(${translate}px,0,0)`);
          if (params.iosAnimateNavbarBackIcon) {
            if (sliding.hasClass('left') && activeNavBackIcon.length > 0) {
              activeNavBackIcon.addClass('navbar-transitioning').transform(`translate3d(${iconTranslate}px,0,0)`);
            }
          }
        }).addClass('navbar-transitioning');

      previousNavElements.transform('').css({ opacity: '' }).each((navElIndex, navEl) => {
        const translate = pageChanged ? 0 : navEl.f7NavbarLeftOffset;
        const sliding = $(navEl);
        let iconTranslate = pageChanged ? 0 : -translate;
        if (!separateNavbar && !pageChanged) iconTranslate += navbarWidth / 5;
        sliding.transform(`translate3d(${translate}px,0,0)`);
        if (params.iosAnimateNavbarBackIcon) {
          if (sliding.hasClass('left') && previousNavBackIcon.length > 0) {
            previousNavBackIcon.addClass('navbar-transitioning').transform(`translate3d(${iconTranslate}px,0,0)`);
          }
        }
      }).addClass('navbar-transitioning');
    }
    allowViewTouchMove = false;
    router.allowPageChange = false;

    // Swipe Back Callback
    const callbackData = {
      currentPage: currentPage[0],
      previousPage: previousPage[0],
      currentNavbar: currentNavbar[0],
      previousNavbar: previousNavbar[0],
    };

    if (pageChanged) {
      // Update Route
      router.currentRoute = previousPage[0].f7Page.route;
      router.currentPage = previousPage[0];

      // Page before animation callback
      router.pageCallback('beforeOut', currentPage, currentNavbar, 'current', 'next', { route: currentPage[0].f7Page.route, swipeBack: true });
      router.pageCallback('beforeIn', previousPage, previousNavbar, 'previous', 'current', { route: previousPage[0].f7Page.route, swipeBack: true });

      $el.trigger('swipeback:beforechange', callbackData);
      router.emit('swipebackBeforeChange', callbackData);
    } else {
      $el.trigger('swipeback:beforereset', callbackData);
      router.emit('swipebackBeforeReset', callbackData);
    }

    currentPage.transitionEnd(() => {
      $([currentPage[0], previousPage[0]]).removeClass('page-transitioning page-transitioning-swipeback');

      if (dynamicNavbar) {
        currentNavElements.removeClass('navbar-transitioning').css({ opacity: '' }).transform('');
        previousNavElements.removeClass('navbar-transitioning').css({ opacity: '' }).transform('');
        if (activeNavBackIcon && activeNavBackIcon.length > 0) activeNavBackIcon.removeClass('navbar-transitioning');
        if (previousNavBackIcon && previousNavBackIcon.length > 0) previousNavBackIcon.removeClass('navbar-transitioning');
      }
      allowViewTouchMove = true;
      router.allowPageChange = true;
      if (pageChanged) {
        // Update History
        if (router.history.length === 1) {
          router.history.unshift(router.url);
        }
        router.history.pop();
        router.saveHistory();

        // Update push state
        if (params.pushState) {
          History.back();
        }

        // Page after animation callback
        router.pageCallback('afterOut', currentPage, currentNavbar, 'current', 'next', { route: currentPage[0].f7Page.route, swipeBack: true });
        router.pageCallback('afterIn', previousPage, previousNavbar, 'previous', 'current', { route: previousPage[0].f7Page.route, swipeBack: true });

        // Remove Old Page
        if (params.stackPages && router.initialPages.indexOf(currentPage[0]) >= 0) {
          currentPage.addClass('stacked');
          if (separateNavbar) {
            currentNavbar.addClass('stacked');
          }
        } else {
          router.pageCallback('beforeRemove', currentPage, currentNavbar, 'next', { swipeBack: true });
          router.removePage(currentPage);
          if (separateNavbar) {
            router.removeNavbar(currentNavbar);
          }
        }

        $el.trigger('swipeback:afterchange', callbackData);
        router.emit('swipebackAfterChange', callbackData);

        router.emit('routeChanged', router.currentRoute, router.previousRoute, router);

        if (params.preloadPreviousPage) {
          router.back(router.history[router.history.length - 2], { preload: true });
        }
      } else {
        $el.trigger('swipeback:afterreset', callbackData);
        router.emit('swipebackAfterReset', callbackData);
      }
      if (pageShadow && pageShadow.length > 0) pageShadow.remove();
      if (pageOpacity && pageOpacity.length > 0) pageOpacity.remove();
    });
  }

  function attachEvents() {
    const passiveListener = (app.touchEvents.start === 'touchstart' && Support.passiveListener) ? { passive: true, capture: false } : false;
    $el.on(app.touchEvents.start, handleTouchStart, passiveListener);
    app.on('touchmove:active', handleTouchMove);
    app.on('touchend:passive', handleTouchEnd);
  }
  function detachEvents() {
    const passiveListener = (app.touchEvents.start === 'touchstart' && Support.passiveListener) ? { passive: true, capture: false } : false;
    $el.off(app.touchEvents.start, handleTouchStart, passiveListener);
    app.off('touchmove:active', handleTouchMove);
    app.off('touchend:passive', handleTouchEnd);
  }

  attachEvents();

  router.on('routerDestroy', detachEvents);
}

function redirect (direction, route, options) {
  const router = this;
  const redirect = route.route.redirect;
  if (options.initial && router.params.pushState) {
    options.replaceState = true; // eslint-disable-line
    options.history = true; // eslint-disable-line
  }
  function redirectResolve(redirectUrl, redirectOptions = {}) {
    router.allowPageChange = true;
    router[direction](redirectUrl, Utils.extend({}, options, redirectOptions));
  }
  function redirectReject() {
    router.allowPageChange = true;
  }
  if (typeof redirect === 'function') {
    router.allowPageChange = false;
    const redirectUrl = redirect.call(router, route, redirectResolve, redirectReject);
    if (redirectUrl && typeof redirectUrl === 'string') {
      router.allowPageChange = true;
      return router[direction](redirectUrl, options);
    }
    return router;
  }
  return router[direction](redirect, options);
}

function refreshPage() {
  const router = this;
  return router.navigate(router.currentRoute.url, {
    ignoreCache: true,
    reloadCurrent: true,
  });
}

function forward(el, forwardOptions = {}) {
  const router = this;
  const app = router.app;
  const view = router.view;

  const options = Utils.extend({
    animate: router.params.animate,
    pushState: true,
    replaceState: false,
    history: true,
    reloadCurrent: router.params.reloadPages,
    reloadPrevious: false,
    reloadAll: false,
    clearPreviousHistory: false,
    on: {},
  }, forwardOptions);

  const dynamicNavbar = router.dynamicNavbar;
  const separateNavbar = router.separateNavbar;

  const $viewEl = router.$el;
  const $newPage = $(el);
  const reload = options.reloadPrevious || options.reloadCurrent || options.reloadAll;
  let $oldPage;

  let $navbarEl;
  let $newNavbarInner;
  let $oldNavbarInner;

  if ($newPage.length) {
    // Remove theme elements
    router.removeThemeElements($newPage);
  }

  if (dynamicNavbar) {
    $newNavbarInner = $newPage.children('.navbar').children('.navbar-inner');
    if (separateNavbar) {
      $navbarEl = router.$navbarEl;
      if ($newNavbarInner.length > 0) {
        $newPage.children('.navbar').remove();
      }
      if ($newNavbarInner.length === 0 && $newPage[0].f7Page) {
        // Try from pageData
        $newNavbarInner = $newPage[0].f7Page.$navbarEl;
      }
    }
  }

  router.allowPageChange = false;
  if ($newPage.length === 0) {
    router.allowPageChange = true;
    return router;
  }

  // Pages In View
  const $pagesInView = $viewEl
    .children('.page:not(.stacked)')
    .filter((index, pageInView) => pageInView !== $newPage[0]);

  // Navbars In View
  let $navbarsInView;
  if (separateNavbar) {
    $navbarsInView = $navbarEl
      .children('.navbar-inner:not(.stacked)')
      .filter((index, navbarInView) => navbarInView !== $newNavbarInner[0]);
  }

  // Exit when reload previous and only 1 page in view so nothing ro reload
  if (options.reloadPrevious && $pagesInView.length < 2) {
    router.allowPageChange = true;
    return router;
  }

  // New Page
  let newPagePosition = 'next';
  if (options.reloadCurrent || options.reloadAll) {
    newPagePosition = 'current';
  } else if (options.reloadPrevious) {
    newPagePosition = 'previous';
  }
  $newPage
    .addClass(`page-${newPagePosition}`)
    .removeClass('stacked');

  if (dynamicNavbar && $newNavbarInner.length) {
    $newNavbarInner
      .addClass(`navbar-${newPagePosition}`)
      .removeClass('stacked');
  }

  // Find Old Page
  if (options.reloadCurrent) {
    $oldPage = $pagesInView.eq($pagesInView.length - 1);
    if (separateNavbar) {
      // $oldNavbarInner = $navbarsInView.eq($pagesInView.length - 1);
      $oldNavbarInner = $(app.navbar.getElByPage($oldPage));
    }
  } else if (options.reloadPrevious) {
    $oldPage = $pagesInView.eq($pagesInView.length - 2);
    if (separateNavbar) {
      // $oldNavbarInner = $navbarsInView.eq($pagesInView.length - 2);
      $oldNavbarInner = $(app.navbar.getElByPage($oldPage));
    }
  } else if (options.reloadAll) {
    $oldPage = $pagesInView.filter((index, pageEl) => pageEl !== $newPage[0]);
    if (separateNavbar) {
      $oldNavbarInner = $navbarsInView.filter((index, navbarEl) => navbarEl !== $newNavbarInner[0]);
    }
  } else {
    if ($pagesInView.length > 1) {
      let i = 0;
      for (i = 0; i < $pagesInView.length - 1; i += 1) {
        const oldNavbarInnerEl = app.navbar.getElByPage($pagesInView.eq(i));
        if (router.params.stackPages) {
          $pagesInView.eq(i).addClass('stacked');
          if (separateNavbar) {
            // $navbarsInView.eq(i).addClass('stacked');
            $(oldNavbarInnerEl).addClass('stacked');
          }
        } else {
          // Page remove event
          router.pageCallback('beforeRemove', $pagesInView[i], $navbarsInView && $navbarsInView[i], 'previous', undefined, options);
          router.removePage($pagesInView[i]);
          if (separateNavbar && oldNavbarInnerEl) {
            router.removeNavbar(oldNavbarInnerEl);
          }
        }
      }
    }
    $oldPage = $viewEl
      .children('.page:not(.stacked)')
      .filter((index, page) => page !== $newPage[0]);
    if (separateNavbar) {
      $oldNavbarInner = $navbarEl
        .children('.navbar-inner:not(.stacked)')
        .filter((index, navbarInner) => navbarInner !== $newNavbarInner[0]);
    }
  }
  if (dynamicNavbar && !separateNavbar) {
    $oldNavbarInner = $oldPage.children('.navbar').children('.navbar-inner');
  }

  // Push State
  if (router.params.pushState && (options.pushState || options.replaceState) && !options.reloadPrevious) {
    const pushStateRoot = router.params.pushStateRoot || '';
    History[options.reloadCurrent || options.reloadAll || options.replaceState ? 'replace' : 'push'](
      view.id,
      {
        url: options.route.url,
      },
      pushStateRoot + router.params.pushStateSeparator + options.route.url
    );
  }

  if (!options.reloadPrevious) {
    // Current Page & Navbar
    router.currentPageEl = $newPage[0];
    if (dynamicNavbar && $newNavbarInner.length) {
      router.currentNavbarEl = $newNavbarInner[0];
    } else {
      delete router.currentNavbarEl;
    }

    // Current Route
    router.currentRoute = options.route;
  }

  // Update router history
  const url = options.route.url;

  if (options.history) {
    if ((options.reloadCurrent && router.history.length) > 0 || options.replaceState) {
      router.history[router.history.length - (options.reloadPrevious ? 2 : 1)] = url;
    } else if (options.reloadPrevious) {
      router.history[router.history.length - 2] = url;
    } else if (options.reloadAll) {
      router.history = [url];
    } else {
      router.history.push(url);
    }
  }
  router.saveHistory();

  // Insert new page and navbar
  const newPageInDom = $newPage.parents(document).length > 0;
  const f7Component = $newPage[0].f7Component;
  if (options.reloadPrevious) {
    if (f7Component && !newPageInDom) {
      f7Component.$mount((componentEl) => {
        $(componentEl).insertBefore($oldPage);
      });
    } else {
      $newPage.insertBefore($oldPage);
    }
    if (separateNavbar && $newNavbarInner.length) {
      if ($oldNavbarInner.length) {
        $newNavbarInner.insertBefore($oldNavbarInner);
      } else {
        if (!router.$navbarEl.parents(document).length) {
          router.$el.prepend(router.$navbarEl);
        }
        $navbarEl.append($newNavbarInner);
      }
    }
  } else {
    if ($oldPage.next('.page')[0] !== $newPage[0]) {
      if (f7Component && !newPageInDom) {
        f7Component.$mount((componentEl) => {
          $viewEl.append(componentEl);
        });
      } else {
        $viewEl.append($newPage[0]);
      }
    }
    if (separateNavbar && $newNavbarInner.length) {
      if (!router.$navbarEl.parents(document).length) {
        router.$el.prepend(router.$navbarEl);
      }
      $navbarEl.append($newNavbarInner[0]);
    }
  }
  if (!newPageInDom) {
    router.pageCallback('mounted', $newPage, $newNavbarInner, newPagePosition, reload ? newPagePosition : 'current', options, $oldPage);
  }

  // Remove old page
  if (options.reloadCurrent && $oldPage.length > 0) {
    if (router.params.stackPages && router.initialPages.indexOf($oldPage[0]) >= 0) {
      $oldPage.addClass('stacked');
      if (separateNavbar) {
        $oldNavbarInner.addClass('stacked');
      }
    } else {
      // Page remove event
      router.pageCallback('beforeRemove', $oldPage, $oldNavbarInner, 'previous', undefined, options);
      router.removePage($oldPage);
      if (separateNavbar && $oldNavbarInner && $oldNavbarInner.length) {
        router.removeNavbar($oldNavbarInner);
      }
    }
  } else if (options.reloadAll) {
    $oldPage.each((index, pageEl) => {
      const $oldPageEl = $(pageEl);
      const $oldNavbarInnerEl = $(app.navbar.getElByPage($oldPageEl));
      if (router.params.stackPages && router.initialPages.indexOf($oldPageEl[0]) >= 0) {
        $oldPageEl.addClass('stacked');
        if (separateNavbar) {
          $oldNavbarInnerEl.addClass('stacked');
        }
      } else {
        // Page remove event
        router.pageCallback('beforeRemove', $oldPageEl, $oldNavbarInner && $oldNavbarInner.eq(index), 'previous', undefined, options);
        router.removePage($oldPageEl);
        if (separateNavbar && $oldNavbarInnerEl.length) {
          router.removeNavbar($oldNavbarInnerEl);
        }
      }
    });
  } else if (options.reloadPrevious) {
    if (router.params.stackPages && router.initialPages.indexOf($oldPage[0]) >= 0) {
      $oldPage.addClass('stacked');
      if (separateNavbar) {
        $oldNavbarInner.addClass('stacked');
      }
    } else {
      // Page remove event
      router.pageCallback('beforeRemove', $oldPage, $oldNavbarInner, 'previous', undefined, options);
      router.removePage($oldPage);
      if (separateNavbar && $oldNavbarInner && $oldNavbarInner.length) {
        router.removeNavbar($oldNavbarInner);
      }
    }
  }

  // Load Tab
  if (options.route.route.tab) {
    router.tabLoad(options.route.route.tab, Utils.extend({}, options, {
      history: false,
      pushState: false,
    }));
  }

  // Page init and before init events
  router.pageCallback('init', $newPage, $newNavbarInner, newPagePosition, reload ? newPagePosition : 'current', options, $oldPage);

  if (options.reloadCurrent || options.reloadAll) {
    router.allowPageChange = true;
    router.pageCallback('beforeIn', $newPage, $newNavbarInner, newPagePosition, 'current', options);
    router.pageCallback('afterIn', $newPage, $newNavbarInner, newPagePosition, 'current', options);
    if (options.reloadCurrent && options.clearPreviousHistory) router.clearPreviousHistory();
    return router;
  }
  if (options.reloadPrevious) {
    router.allowPageChange = true;
    return router;
  }

  // Before animation event
  router.pageCallback('beforeIn', $newPage, $newNavbarInner, 'next', 'current', options);
  router.pageCallback('beforeOut', $oldPage, $oldNavbarInner, 'current', 'previous', options);

  // Animation
  function afterAnimation() {
    const pageClasses = 'page-previous page-current page-next';
    const navbarClasses = 'navbar-previous navbar-current navbar-next';
    $newPage.removeClass(pageClasses).addClass('page-current').removeAttr('aria-hidden');
    $oldPage.removeClass(pageClasses).addClass('page-previous').attr('aria-hidden', 'true');
    if (dynamicNavbar) {
      $newNavbarInner.removeClass(navbarClasses).addClass('navbar-current').removeAttr('aria-hidden');
      $oldNavbarInner.removeClass(navbarClasses).addClass('navbar-previous').attr('aria-hidden', 'true');
    }
    // After animation event
    router.allowPageChange = true;
    router.pageCallback('afterIn', $newPage, $newNavbarInner, 'next', 'current', options);
    router.pageCallback('afterOut', $oldPage, $oldNavbarInner, 'current', 'previous', options);

    let keepOldPage = app.theme === 'ios' ? (router.params.preloadPreviousPage || router.params.iosSwipeBack) : router.params.preloadPreviousPage;
    if (!keepOldPage) {
      if ($newPage.hasClass('smart-select-page') || $newPage.hasClass('photo-browser-page') || $newPage.hasClass('autocomplete-page')) {
        keepOldPage = true;
      }
    }
    if (!keepOldPage) {
      if (router.params.stackPages) {
        $oldPage.addClass('stacked');
        if (separateNavbar) {
          $oldNavbarInner.addClass('stacked');
        }
      } else if (!($newPage.attr('data-name') && $newPage.attr('data-name') === 'smart-select-page')) {
        // Remove event
        router.pageCallback('beforeRemove', $oldPage, $oldNavbarInner, 'previous', undefined, options);
        router.removePage($oldPage);
        if (separateNavbar && $oldNavbarInner.length) {
          router.removeNavbar($oldNavbarInner);
        }
      }
    }
    if (options.clearPreviousHistory) router.clearPreviousHistory();
    router.emit('routeChanged', router.currentRoute, router.previousRoute, router);

    if (router.params.pushState) {
      History.clearRouterQueue();
    }
  }
  function setPositionClasses() {
    const pageClasses = 'page-previous page-current page-next';
    const navbarClasses = 'navbar-previous navbar-current navbar-next';
    $oldPage.removeClass(pageClasses).addClass('page-current').removeAttr('aria-hidden');
    $newPage.removeClass(pageClasses).addClass('page-next').removeAttr('aria-hidden');
    if (dynamicNavbar) {
      $oldNavbarInner.removeClass(navbarClasses).addClass('navbar-current').removeAttr('aria-hidden');
      $newNavbarInner.removeClass(navbarClasses).addClass('navbar-next').removeAttr('aria-hidden');
    }
  }
  if (options.animate) {
    const delay = router.app.theme === 'md' ? router.params.materialPageLoadDelay : router.params.iosPageLoadDelay;
    if (delay) {
      setTimeout(() => {
        setPositionClasses();
        router.animate($oldPage, $newPage, $oldNavbarInner, $newNavbarInner, 'forward', () => {
          afterAnimation();
        });
      }, delay);
    } else {
      setPositionClasses();
      router.animate($oldPage, $newPage, $oldNavbarInner, $newNavbarInner, 'forward', () => {
        afterAnimation();
      });
    }
  } else {
    afterAnimation();
  }
  return router;
}
function load(loadParams = {}, loadOptions = {}, ignorePageChange) {
  const router = this;
  if (!router.allowPageChange && !ignorePageChange) return router;
  const params = loadParams;
  const options = loadOptions;
  const { url, content, el, pageName, template, templateUrl, component, componentUrl } = params;

  if (!options.reloadCurrent &&
    options.route &&
    options.route.route &&
    options.route.route.parentPath &&
    router.currentRoute.route &&
    router.currentRoute.route.parentPath === options.route.route.parentPath) {
    // Do something nested
    if (options.route.url === router.url) {
      return false;
    }
    // Check for same params
    let sameParams = Object.keys(options.route.params).length === Object.keys(router.currentRoute.params).length;
    if (sameParams) {
      // Check for equal params name
      Object.keys(options.route.params).forEach((paramName) => {
        if (
          !(paramName in router.currentRoute.params) ||
          (router.currentRoute.params[paramName] !== options.route.params[paramName])
        ) {
          sameParams = false;
        }
      });
    }
    if (sameParams) {
      if (options.route.route.tab) {
        return router.tabLoad(options.route.route.tab, options);
      }
      return false;
    }
  }

  if (
    options.route &&
    options.route.url &&
    router.url === options.route.url &&
    !(options.reloadCurrent || options.reloadPrevious) &&
    !router.params.allowDuplicateUrls
  ) {
    router.allowPageChange = true;
    return false;
  }

  if (!options.route && url) {
    options.route = router.parseRouteUrl(url);
    Utils.extend(options.route, { route: { url, path: url } });
  }

  // Component Callbacks
  function resolve(pageEl, newOptions) {
    return router.forward(pageEl, Utils.extend(options, newOptions));
  }
  function reject() {
    router.allowPageChange = true;
    return router;
  }

  if (url || templateUrl || componentUrl) {
    router.allowPageChange = false;
  }

  // Proceed
  if (content) {
    router.forward(router.getPageEl(content), options);
  } else if (template || templateUrl) {
    // Parse template and send page element
    try {
      router.pageTemplateLoader(template, templateUrl, options, resolve, reject);
    } catch (err) {
      router.allowPageChange = true;
      throw err;
    }
  } else if (el) {
    // Load page from specified HTMLElement or by page name in pages container
    router.forward(router.getPageEl(el), options);
  } else if (pageName) {
    // Load page by page name in pages container
    router.forward(router.$el.children(`.page[data-name="${pageName}"]`).eq(0), options);
  } else if (component || componentUrl) {
    // Load from component (F7/Vue/React/...)
    try {
      router.pageComponentLoader(router.el, component, componentUrl, options, resolve, reject);
    } catch (err) {
      router.allowPageChange = true;
      throw err;
    }
  } else if (url) {
    // Load using XHR
    if (router.xhr) {
      router.xhr.abort();
      router.xhr = false;
    }
    router.xhrRequest(url, options)
      .then((pageContent) => {
        router.forward(router.getPageEl(pageContent), options);
      })
      .catch(() => {
        router.allowPageChange = true;
      });
  }
  return router;
}
function navigate(navigateParams, navigateOptions = {}) {
  const router = this;
  let url;
  let createRoute;
  if (typeof navigateParams === 'string') {
    url = navigateParams;
  } else {
    url = navigateParams.url;
    createRoute = navigateParams.route;
  }
  const app = router.app;
  if (!router.view) {
    if (app.views.main) {
      app.views.main.router.navigate(url, navigateOptions);
    }
    return router;
  }
  if (url === '#' || url === '') {
    return router;
  }

  let navigateUrl = url.replace('./', '');
  if (navigateUrl[0] !== '/' && navigateUrl.indexOf('#') !== 0) {
    const currentPath = router.currentRoute.parentPath || router.currentRoute.path;
    navigateUrl = ((currentPath ? `${currentPath}/` : '/') + navigateUrl)
      .replace('///', '/')
      .replace('//', '/');
  }
  let route;
  if (createRoute) {
    route = Utils.extend(router.parseRouteUrl(navigateUrl), {
      route: Utils.extend({}, createRoute),
    });
  } else {
    route = router.findMatchingRoute(navigateUrl);
  }

  if (!route) {
    return router;
  }

  if (route.route.redirect) {
    return redirect.call(router, 'navigate', route, navigateOptions);
  }

  const options = {};
  if (route.route.options) {
    Utils.extend(options, route.route.options, navigateOptions, { route });
  } else {
    Utils.extend(options, navigateOptions, { route });
  }
  if (options && options.context) {
    route.context = options.context;
    options.route.context = options.context;
  }
  ('popup popover sheet loginScreen actions customModal').split(' ').forEach((modalLoadProp) => {
    if (route.route[modalLoadProp]) {
      router.modalLoad(modalLoadProp, route, options);
    }
  });
  ('url content component pageName el componentUrl template templateUrl').split(' ').forEach((pageLoadProp) => {
    if (route.route[pageLoadProp]) {
      router.load({ [pageLoadProp]: route.route[pageLoadProp] }, options);
    }
  });
  // Async
  function asyncResolve(resolveParams, resolveOptions) {
    router.allowPageChange = false;
    let resolvedAsModal = false;
    if (resolveOptions && resolveOptions.context) {
      if (!route.context) route.context = resolveOptions.context;
      else route.context = Utils.extend({}, route.context, resolveOptions.context);
      options.route.context = route.context;
    }
    ('popup popover sheet loginScreen actions customModal').split(' ').forEach((modalLoadProp) => {
      if (resolveParams[modalLoadProp]) {
        resolvedAsModal = true;
        const modalRoute = Utils.extend({}, route, { route: resolveParams });
        router.allowPageChange = true;
        router.modalLoad(modalLoadProp, modalRoute, Utils.extend(options, resolveOptions));
      }
    });
    if (resolvedAsModal) return;
    router.load(resolveParams, Utils.extend(options, resolveOptions), true);
  }
  function asyncReject() {
    router.allowPageChange = true;
  }
  if (route.route.async) {
    router.allowPageChange = false;

    route.route.async.call(router, route, router.currentRoute, asyncResolve, asyncReject);
  }
  // Return Router
  return router;
}

function tabLoad(tabRoute, loadOptions = {}) {
  const router = this;
  const options = Utils.extend({
    animate: router.params.animate,
    pushState: true,
    history: true,
    parentPageEl: null,
    preload: false,
    on: {},
  }, loadOptions);

  let currentRoute;
  let previousRoute;
  if (options.route) {
    // Set Route
    if (!options.preload && options.route !== router.currentRoute) {
      previousRoute = router.previousRoute;
      router.currentRoute = options.route;
    }
    if (options.preload) {
      currentRoute = options.route;
      previousRoute = router.currentRoute;
    } else {
      currentRoute = router.currentRoute;
      if (!previousRoute) previousRoute = router.previousRoute;
    }

    // Update Browser History
    if (router.params.pushState && options.pushState && !options.reloadPrevious) {
      History.replace(
        router.view.id,
        {
          url: options.route.url,
        },
        (router.params.pushStateRoot || '') + router.params.pushStateSeparator + options.route.url
      );
    }

    // Update Router History
    if (options.history) {
      router.history[Math.max(router.history.length - 1, 0)] = options.route.url;
      router.saveHistory();
    }
  }

  // Show Tab
  const $parentPageEl = $(options.parentPageEl || router.currentPageEl);
  let tabEl;
  if ($parentPageEl.length && $parentPageEl.find(`#${tabRoute.id}`).length) {
    tabEl = $parentPageEl.find(`#${tabRoute.id}`).eq(0);
  } else if (router.view.selector) {
    tabEl = `${router.view.selector} #${tabRoute.id}`;
  } else {
    tabEl = `#${tabRoute.id}`;
  }
  const tabShowResult = router.app.tab.show({
    tabEl,
    animate: options.animate,
    tabRoute: options.route,
  });

  const { $newTabEl, $oldTabEl, animated, onTabsChanged } = tabShowResult;

  if ($newTabEl && $newTabEl.parents('.page').length > 0 && options.route) {
    const tabParentPageData = $newTabEl.parents('.page')[0].f7Page;
    if (tabParentPageData && options.route) {
      tabParentPageData.route = options.route;
    }
  }

  // Tab Content Loaded
  function onTabLoaded(contentEl) {
    // Remove theme elements
    router.removeThemeElements($newTabEl);

    let tabEventTarget = $newTabEl;
    if (typeof contentEl !== 'string') tabEventTarget = $(contentEl);

    tabEventTarget.trigger('tab:init tab:mounted', tabRoute);
    router.emit('tabInit tabMounted', $newTabEl[0], tabRoute);

    if ($oldTabEl && router.params.unloadTabContent) {
      if (animated) {
        onTabsChanged(() => {
          router.tabRemove($oldTabEl, $newTabEl, tabRoute);
        });
      } else {
        router.tabRemove($oldTabEl, $newTabEl, tabRoute);
      }
    }
  }
  if (!router.params.unloadTabContent) {
    if ($newTabEl[0].f7RouterTabLoaded) return router;
  }

  // Load Tab Content
  function loadTab(loadTabParams, loadTabOptions) {
    // Load Tab Props
    const { url, content, el, template, templateUrl, component, componentUrl } = loadTabParams;
    // Component/Template Callbacks
    function resolve(contentEl) {
      router.allowPageChange = true;
      if (!contentEl) return;
      if (typeof contentEl === 'string') {
        $newTabEl.html(contentEl);
      } else {
        $newTabEl.html('');
        if (contentEl.f7Component) {
          contentEl.f7Component.$mount((componentEl) => {
            $newTabEl.append(componentEl);
          });
        } else {
          $newTabEl.append(contentEl);
        }
      }
      if (!router.params.unloadTabContent) {
        $newTabEl[0].f7RouterTabLoaded = true;
      }
      onTabLoaded(contentEl);
    }
    function reject() {
      router.allowPageChange = true;
      return router;
    }

    if (content) {
      resolve(content);
    } else if (template || templateUrl) {
      try {
        router.tabTemplateLoader(template, templateUrl, loadTabOptions, resolve, reject);
      } catch (err) {
        router.allowPageChange = true;
        throw err;
      }
    } else if (el) {
      resolve(el);
    } else if (component || componentUrl) {
      // Load from component (F7/Vue/React/...)
      try {
        router.tabComponentLoader($newTabEl[0], component, componentUrl, loadTabOptions, resolve, reject);
      } catch (err) {
        router.allowPageChange = true;
        throw err;
      }
    } else if (url) {
      // Load using XHR
      if (router.xhr) {
        router.xhr.abort();
        router.xhr = false;
      }
      router.xhrRequest(url, loadTabOptions)
        .then((tabContent) => {
          resolve(tabContent);
        })
        .catch(() => {
          router.allowPageChange = true;
        });
    }
  }

  ('url content component el componentUrl template templateUrl').split(' ').forEach((tabLoadProp) => {
    if (tabRoute[tabLoadProp]) {
      loadTab({ [tabLoadProp]: tabRoute[tabLoadProp] }, options);
    }
  });

  // Async
  function asyncResolve(resolveParams, resolveOptions) {
    loadTab(resolveParams, Utils.extend(options, resolveOptions));
  }
  function asyncReject() {
    router.allowPageChange = true;
  }
  if (tabRoute.async) {
    tabRoute.async.call(router, currentRoute, previousRoute, asyncResolve, asyncReject);
  }
  return router;
}
function tabRemove($oldTabEl, $newTabEl, tabRoute) {
  const router = this;
  let hasTabComponentChild;
  $oldTabEl.children().each((index, tabChild) => {
    if (tabChild.f7Component) {
      hasTabComponentChild = true;
      $(tabChild).trigger('tab:beforeremove', tabRoute);
      tabChild.f7Component.$destroy();
    }
  });
  if (!hasTabComponentChild) {
    $oldTabEl.trigger('tab:beforeremove', tabRoute);
  }
  router.emit('tabBeforeRemove', $oldTabEl[0], $newTabEl[0], tabRoute);
  router.removeTabContent($oldTabEl[0], tabRoute);
}

function modalLoad(modalType, route, loadOptions = {}) {
  const router = this;
  const app = router.app;

  const options = Utils.extend({
    animate: router.params.animate,
    pushState: true,
    history: true,
    on: {},
  }, loadOptions);

  const modalParams = Utils.extend({}, route.route[modalType]);
  const modalRoute = route.route;

  function onModalLoaded() {
    // Create Modal
    const modal = app[modalType].create(modalParams);
    modalRoute.modalInstance = modal;

    const hasEl = modal.el;

    function closeOnSwipeBack() {
      modal.close();
    }
    modal.on('modalOpen', () => {
      if (!hasEl) {
        // Remove theme elements
        router.removeThemeElements(modal.el);

        // Emit events
        modal.$el.trigger(`${modalType.toLowerCase()}:init ${modalType.toLowerCase()}:mounted`, route, modal);
        router.emit(`modalInit ${modalType}Init ${modalType}Mounted`, modal.el, route, modal);
      }
      router.once('swipeBackMove', closeOnSwipeBack);
    });
    modal.on('modalClose', () => {
      router.off('swipeBackMove', closeOnSwipeBack);
      if (!modal.closeByRouter) {
        router.back();
      }
    });

    modal.on('modalClosed', () => {
      modal.$el.trigger(`${modalType.toLowerCase()}:beforeremove`, route, modal);
      modal.emit(`modalBeforeRemove ${modalType}BeforeRemove`, modal.el, route, modal);
      const modalComponent = modal.el.f7Component;
      if (modalComponent) {
        modalComponent.$destroy();
      }
      Utils.nextTick(() => {
        if (modalComponent || modalParams.component) {
          router.removeModal(modal.el);
        }
        modal.destroy();
        delete modalRoute.modalInstance;
      });
    });

    if (options.route) {
      // Update Browser History
      if (router.params.pushState && options.pushState) {
        History.push(
          router.view.id,
          {
            url: options.route.url,
            modal: modalType,
          },
          (router.params.pushStateRoot || '') + router.params.pushStateSeparator + options.route.url
        );
      }

      // Set Route
      if (options.route !== router.currentRoute) {
        router.currentRoute = Utils.extend(options.route, { modal });
      }

      // Update Router History
      if (options.history) {
        router.history.push(options.route.url);
        router.saveHistory();
      }
    }

    if (hasEl) {
      // Remove theme elements
      router.removeThemeElements(modal.el);

      // Emit events
      modal.$el.trigger(`${modalType.toLowerCase()}:init ${modalType.toLowerCase()}:mounted`, route, modal);
      router.emit(`modalInit ${modalType}Init ${modalType}Mounted`, modal.el, route, modal);
    }

    // Open
    modal.open();
  }

  // Load Modal Content
  function loadModal(loadModalParams, loadModalOptions) {
    // Load Modal Props
    const { url, content, template, templateUrl, component, componentUrl } = loadModalParams;

    // Component/Template Callbacks
    function resolve(contentEl) {
      if (contentEl) {
        if (typeof contentEl === 'string') {
          modalParams.content = contentEl;
        } else if (contentEl.f7Component) {
          contentEl.f7Component.$mount((componentEl) => {
            modalParams.el = componentEl;
            app.root.append(componentEl);
          });
        } else {
          modalParams.el = contentEl;
        }
        onModalLoaded();
      }
    }
    function reject() {
      router.allowPageChange = true;
      return router;
    }

    if (content) {
      resolve(content);
    } else if (template || templateUrl) {
      try {
        router.modalTemplateLoader(template, templateUrl, loadModalOptions, resolve, reject);
      } catch (err) {
        router.allowPageChange = true;
        throw err;
      }
    } else if (component || componentUrl) {
      // Load from component (F7/Vue/React/...)
      try {
        router.modalComponentLoader(app.root[0], component, componentUrl, loadModalOptions, resolve, reject);
      } catch (err) {
        router.allowPageChange = true;
        throw err;
      }
    } else if (url) {
      // Load using XHR
      if (router.xhr) {
        router.xhr.abort();
        router.xhr = false;
      }
      router.xhrRequest(url, loadModalOptions)
        .then((modalContent) => {
          modalParams.content = modalContent;
          onModalLoaded();
        })
        .catch(() => {
          router.allowPageChange = true;
        });
    } else {
      onModalLoaded();
    }
  }

  let foundLoadProp;
  ('url content component el componentUrl template templateUrl').split(' ').forEach((modalLoadProp) => {
    if (modalParams[modalLoadProp] && !foundLoadProp) {
      foundLoadProp = true;
      loadModal({ [modalLoadProp]: modalParams[modalLoadProp] }, options);
    }
  });
  if (!foundLoadProp && modalType === 'actions') {
    onModalLoaded();
  }

  // Async
  function asyncResolve(resolveParams, resolveOptions) {
    loadModal(resolveParams, Utils.extend(options, resolveOptions));
  }
  function asyncReject() {
    router.allowPageChange = true;
  }
  if (modalParams.async) {
    modalParams.async.call(router, options.route, router.currentRoute, asyncResolve, asyncReject);
  }
  return router;
}
function modalRemove(modal) {
  Utils.extend(modal, { closeByRouter: true });
  modal.close();
}

function backward(el, backwardOptions) {
  const router = this;
  const app = router.app;
  const view = router.view;

  const options = Utils.extend({
    animate: router.params.animate,
    pushState: true,
  }, backwardOptions);

  const dynamicNavbar = router.dynamicNavbar;
  const separateNavbar = router.separateNavbar;

  const $newPage = $(el);
  const $oldPage = router.$el.children('.page-current');

  if ($newPage.length) {
    // Remove theme elements
    router.removeThemeElements($newPage);
  }

  let $navbarEl;
  let $newNavbarInner;
  let $oldNavbarInner;

  if (dynamicNavbar) {
    $newNavbarInner = $newPage.children('.navbar').children('.navbar-inner');
    if (separateNavbar) {
      $navbarEl = router.$navbarEl;
      if ($newNavbarInner.length > 0) {
        $newPage.children('.navbar').remove();
      }
      if ($newNavbarInner.length === 0 && $newPage[0].f7Page) {
        // Try from pageData
        $newNavbarInner = $newPage[0].f7Page.$navbarEl;
      }
      $oldNavbarInner = $navbarEl.find('.navbar-current');
    } else {
      $oldNavbarInner = $oldPage.children('.navbar').children('.navbar-inner');
    }
  }

  router.allowPageChange = false;
  if ($newPage.length === 0 || $oldPage.length === 0) {
    router.allowPageChange = true;
    return router;
  }

  // Remove theme elements
  router.removeThemeElements($newPage);

  // New Page
  $newPage
    .addClass('page-previous')
    .removeClass('stacked')
    .removeAttr('aria-hidden');

  if (dynamicNavbar && $newNavbarInner.length > 0) {
    $newNavbarInner
      .addClass('navbar-previous')
      .removeClass('stacked')
      .removeAttr('aria-hidden');
  }


  // Remove previous page in case of "forced"
  let backIndex;
  if (options.force) {
    if ($oldPage.prev('.page-previous:not(.stacked)').length > 0 || $oldPage.prev('.page-previous').length === 0) {
      if (router.history.indexOf(options.route.url) >= 0) {
        backIndex = router.history.length - router.history.indexOf(options.route.url) - 1;
        router.history = router.history.slice(0, router.history.indexOf(options.route.url) + 2);
        view.history = router.history;
      } else if (router.history[[router.history.length - 2]]) {
        router.history[router.history.length - 2] = options.route.url;
      } else {
        router.history.unshift(router.url);
      }

      if (backIndex && router.params.stackPages) {
        $oldPage.prevAll('.page-previous').each((index, pageToRemove) => {
          const $pageToRemove = $(pageToRemove);
          let $navbarToRemove;
          if (separateNavbar) {
            // $navbarToRemove = $oldNavbarInner.prevAll('.navbar-previous').eq(index);
            $navbarToRemove = $(app.navbar.getElByPage($pageToRemove));
          }
          if ($pageToRemove[0] !== $newPage[0] && $pageToRemove.index() > $newPage.index()) {
            if (router.initialPages.indexOf($pageToRemove[0]) >= 0) {
              $pageToRemove.addClass('stacked');
              if (separateNavbar) {
                $navbarToRemove.addClass('stacked');
              }
            } else {
              router.pageCallback('beforeRemove', $pageToRemove, $navbarToRemove, 'previous', undefined, options);
              router.removePage($pageToRemove);
              if (separateNavbar && $navbarToRemove.length > 0) {
                router.removeNavbar($navbarToRemove);
              }
            }
          }
        });
      } else {
        const $pageToRemove = $oldPage.prev('.page-previous:not(.stacked)');
        let $navbarToRemove;
        if (separateNavbar) {
          // $navbarToRemove = $oldNavbarInner.prev('.navbar-inner:not(.stacked)');
          $navbarToRemove = $(app.navbar.getElByPage($pageToRemove));
        }
        if (router.params.stackPages && router.initialPages.indexOf($pageToRemove[0]) >= 0) {
          $pageToRemove.addClass('stacked');
          $navbarToRemove.addClass('stacked');
        } else if ($pageToRemove.length > 0) {
          router.pageCallback('beforeRemove', $pageToRemove, $navbarToRemove, 'previous', undefined, options);
          router.removePage($pageToRemove);
          if (separateNavbar && $navbarToRemove.length) {
            router.removeNavbar($navbarToRemove);
          }
        }
      }
    }
  }

  // Insert new page
  const newPageInDom = $newPage.parents(document).length > 0;
  const f7Component = $newPage[0].f7Component;

  function insertPage() {
    if ($newPage.next($oldPage).length === 0) {
      if (!newPageInDom && f7Component) {
        f7Component.$mount((componentEl) => {
          $(componentEl).insertBefore($oldPage);
        });
      } else {
        $newPage.insertBefore($oldPage);
      }
    }
    if (separateNavbar && $newNavbarInner.length) {
      $newNavbarInner.insertBefore($oldNavbarInner);
      if ($oldNavbarInner.length > 0) {
        $newNavbarInner.insertBefore($oldNavbarInner);
      } else {
        if (!router.$navbarEl.parents(document).length) {
          router.$el.prepend(router.$navbarEl);
        }
        $navbarEl.append($newNavbarInner);
      }
    }
    if (!newPageInDom) {
      router.pageCallback('mounted', $newPage, $newNavbarInner, 'previous', 'current', options, $oldPage);
    }
  }

  if (options.preload) {
    // Insert Page
    insertPage();
    // Tab route
    if (options.route.route.tab) {
      router.tabLoad(options.route.route.tab, Utils.extend({}, options, {
        history: false,
        pushState: false,
        preload: true,
      }));
    }
    // Page init and before init events
    router.pageCallback('init', $newPage, $newNavbarInner, 'previous', 'current', options, $oldPage);
    if ($newPage.prevAll('.page-previous:not(.stacked)').length > 0) {
      $newPage.prevAll('.page-previous:not(.stacked)').each((index, pageToRemove) => {
        const $pageToRemove = $(pageToRemove);
        let $navbarToRemove;
        if (separateNavbar) {
          // $navbarToRemove = $newNavbarInner.prevAll('.navbar-previous:not(.stacked)').eq(index);
          $navbarToRemove = $(app.navbar.getElByPage($pageToRemove));
        }
        if (router.params.stackPages && router.initialPages.indexOf(pageToRemove) >= 0) {
          $pageToRemove.addClass('stacked');
          if (separateNavbar) {
            $navbarToRemove.addClass('stacked');
          }
        } else {
          router.pageCallback('beforeRemove', $pageToRemove, $navbarToRemove, 'previous', undefined);
          router.removePage($pageToRemove);
          if (separateNavbar && $navbarToRemove.length) {
            router.removeNavbar($navbarToRemove);
          }
        }
      });
    }
    router.allowPageChange = true;
    return router;
  }

  // History State
  if (router.params.pushState && options.pushState) {
    if (backIndex) History.go(-backIndex);
    else History.back();
  }

  // Update History
  if (router.history.length === 1) {
    router.history.unshift(router.url);
  }
  router.history.pop();
  router.saveHistory();

  // Current Page & Navbar
  router.currentPageEl = $newPage[0];
  if (dynamicNavbar && $newNavbarInner.length) {
    router.currentNavbarEl = $newNavbarInner[0];
  } else {
    delete router.currentNavbarEl;
  }

  // Current Route
  router.currentRoute = options.route;

  // Insert Page
  insertPage();

  // Load Tab
  if (options.route.route.tab) {
    router.tabLoad(options.route.route.tab, Utils.extend({}, options, {
      history: false,
      pushState: false,
    }));
  }

  // Page init and before init events
  router.pageCallback('init', $newPage, $newNavbarInner, 'previous', 'current', options, $oldPage);

  // Before animation callback
  router.pageCallback('beforeIn', $newPage, $newNavbarInner, 'previous', 'current', options);
  router.pageCallback('beforeOut', $oldPage, $oldNavbarInner, 'current', 'next', options);

  // Animation
  function afterAnimation() {
    // Set classes
    const pageClasses = 'page-previous page-current page-next';
    const navbarClasses = 'navbar-previous navbar-current navbar-next';
    $newPage.removeClass(pageClasses).addClass('page-current').removeAttr('aria-hidden');
    $oldPage.removeClass(pageClasses).addClass('page-next').attr('aria-hidden', 'true');
    if (dynamicNavbar) {
      $newNavbarInner.removeClass(navbarClasses).addClass('navbar-current').removeAttr('aria-hidden');
      $oldNavbarInner.removeClass(navbarClasses).addClass('navbar-next').attr('aria-hidden', 'true');
    }

    // After animation event
    router.pageCallback('afterIn', $newPage, $newNavbarInner, 'previous', 'current', options);
    router.pageCallback('afterOut', $oldPage, $oldNavbarInner, 'current', 'next', options);

    // Remove Old Page
    if (router.params.stackPages && router.initialPages.indexOf($oldPage[0]) >= 0) {
      $oldPage.addClass('stacked');
      if (separateNavbar) {
        $oldNavbarInner.addClass('stacked');
      }
    } else {
      router.pageCallback('beforeRemove', $oldPage, $oldNavbarInner, 'next', undefined, options);
      router.removePage($oldPage);
      if (separateNavbar && $oldNavbarInner.length) {
        router.removeNavbar($oldNavbarInner);
      }
    }

    router.allowPageChange = true;
    router.emit('routeChanged', router.currentRoute, router.previousRoute, router);

    // Preload previous page
    const preloadPreviousPage = app.theme === 'ios' ? (router.params.preloadPreviousPage || router.params.iosSwipeBack) : router.params.preloadPreviousPage;
    if (preloadPreviousPage) {
      router.back(router.history[router.history.length - 2], { preload: true });
    }
    if (router.params.pushState) {
      History.clearRouterQueue();
    }
  }

  function setPositionClasses() {
    const pageClasses = 'page-previous page-current page-next';
    const navbarClasses = 'navbar-previous navbar-current navbar-next';
    $oldPage.removeClass(pageClasses).addClass('page-current');
    $newPage.removeClass(pageClasses).addClass('page-previous').removeAttr('aria-hidden');
    if (dynamicNavbar) {
      $oldNavbarInner.removeClass(navbarClasses).addClass('navbar-current');
      $newNavbarInner.removeClass(navbarClasses).addClass('navbar-previous').removeAttr('aria-hidden');
    }
  }

  if (options.animate) {
    setPositionClasses();
    router.animate($oldPage, $newPage, $oldNavbarInner, $newNavbarInner, 'backward', () => {
      afterAnimation();
    });
  } else {
    afterAnimation();
  }

  return router;
}
function loadBack(backParams, backOptions, ignorePageChange) {
  const router = this;

  if (!router.allowPageChange && !ignorePageChange) return router;
  const params = backParams;
  const options = backOptions;
  const { url, content, el, pageName, template, templateUrl, component, componentUrl } = params;

  if (
    options.route.url &&
    router.url === options.route.url &&
    !(options.reloadCurrent || options.reloadPrevious) &&
    !router.params.allowDuplicateUrls
  ) {
    return false;
  }

  if (!options.route && url) {
    options.route = router.parseRouteUrl(url);
  }

  // Component Callbacks
  function resolve(pageEl, newOptions) {
    return router.backward(pageEl, Utils.extend(options, newOptions));
  }
  function reject() {
    router.allowPageChange = true;
    return router;
  }

  if (url || templateUrl || componentUrl) {
    router.allowPageChange = false;
  }

  // Proceed
  if (content) {
    router.backward(router.getPageEl(content), options);
  } else if (template || templateUrl) {
    // Parse template and send page element
    try {
      router.pageTemplateLoader(template, templateUrl, options, resolve, reject);
    } catch (err) {
      router.allowPageChange = true;
      throw err;
    }
  } else if (el) {
    // Load page from specified HTMLElement or by page name in pages container
    router.backward(router.getPageEl(el), options);
  } else if (pageName) {
    // Load page by page name in pages container
    router.backward(router.$el.children(`.page[data-name="${pageName}"]`).eq(0), options);
  } else if (component || componentUrl) {
    // Load from component (F7/Vue/React/...)
    try {
      router.pageComponentLoader(router.el, component, componentUrl, options, resolve, reject);
    } catch (err) {
      router.allowPageChange = true;
      throw err;
    }
  } else if (url) {
    // Load using XHR
    if (router.xhr) {
      router.xhr.abort();
      router.xhr = false;
    }
    router.xhrRequest(url, options)
      .then((pageContent) => {
        router.backward(router.getPageEl(pageContent), options);
      })
      .catch(() => {
        router.allowPageChange = true;
      });
  }
  return router;
}
function back(...args) {
  let navigateUrl;
  let navigateOptions;
  if (typeof args[0] === 'object') {
    navigateOptions = args[0] || {};
  } else {
    navigateUrl = args[0];
    navigateOptions = args[1] || {};
  }

  const router = this;
  const app = router.app;
  if (!router.view) {
    app.views.main.router.back(navigateUrl, navigateOptions);
    return router;
  }

  let currentRouteIsModal = router.currentRoute.modal;
  let modalType;
  if (!currentRouteIsModal) {
    ('popup popover sheet loginScreen actions customModal').split(' ').forEach((modalLoadProp) => {
      if (router.currentRoute.route[modalLoadProp]) {
        currentRouteIsModal = true;
        modalType = modalLoadProp;
      }
    });
  }
  if (currentRouteIsModal) {
    const modalToClose = router.currentRoute.modal ||
                         router.currentRoute.route.modalInstance ||
                         app[modalType].get();
    const previousUrl = router.history[router.history.length - 2];
    let previousRoute = router.findMatchingRoute(previousUrl);
    if (!previousRoute && previousUrl) {
      previousRoute = {
        url: previousUrl,
        path: previousUrl.split('?')[0],
        query: Utils.parseUrlQuery(previousUrl),
        route: {
          path: previousUrl.split('?')[0],
          url: previousUrl,
        },
      };
    }
    if (!previousRoute || !modalToClose) {
      return router;
    }
    if (router.params.pushState && navigateOptions.pushState !== false) {
      History.back();
    }
    router.currentRoute = previousRoute;
    router.history.pop();
    router.saveHistory();
    router.modalRemove(modalToClose);
    return router;
  }
  const $previousPage = router.$el.children('.page-current').prevAll('.page-previous').eq(0);
  if (!navigateOptions.force && $previousPage.length > 0) {
    if (router.params.pushState && $previousPage[0].f7Page && router.history[router.history.length - 2] !== $previousPage[0].f7Page.route.url) {
      router.back(router.history[router.history.length - 2], Utils.extend(navigateOptions, { force: true }));
      return router;
    }
    router.loadBack({ el: $previousPage }, Utils.extend(navigateOptions, {
      route: $previousPage[0].f7Page.route,
    }));
    return router;
  }

  // Navigate URL
  if (navigateUrl === '#') {
    navigateUrl = undefined;
  }
  if (navigateUrl && navigateUrl[0] !== '/' && navigateUrl.indexOf('#') !== 0) {
    navigateUrl = ((router.path || '/') + navigateUrl).replace('//', '/');
  }
  if (!navigateUrl && router.history.length > 1) {
    navigateUrl = router.history[router.history.length - 2];
  }

  // Find route to load
  let route = router.findMatchingRoute(navigateUrl);
  if (!route) {
    if (navigateUrl) {
      route = {
        url: navigateUrl,
        path: navigateUrl.split('?')[0],
        query: Utils.parseUrlQuery(navigateUrl),
        route: {
          path: navigateUrl.split('?')[0],
          url: navigateUrl,
        },
      };
    }
  }
  if (!route) {
    return router;
  }

  if (route.route.redirect) {
    return redirect.call(router, 'back', route, navigateOptions);
  }

  const options = {};
  if (route.route.options) {
    Utils.extend(options, route.route.options, navigateOptions, { route });
  } else {
    Utils.extend(options, navigateOptions, { route });
  }

  if (options && options.context) {
    route.context = options.context;
    options.route.context = options.context;
  }

  if (options.force && router.params.stackPages) {
    router.$el.children('.page-previous.stacked').each((index, pageEl) => {
      if (pageEl.f7Page && pageEl.f7Page.route && pageEl.f7Page.route.url === route.url) {
        router.loadBack({ el: pageEl }, options);
      }
    });
  }

  ('url content component pageName el componentUrl template templateUrl').split(' ').forEach((pageLoadProp) => {
    if (route.route[pageLoadProp]) {
      router.loadBack({ [pageLoadProp]: route.route[pageLoadProp] }, options);
    }
  });
  // Async
  function asyncResolve(resolveParams, resolveOptions) {
    router.allowPageChange = false;
    if (resolveOptions && resolveOptions.context) {
      if (!route.context) route.context = resolveOptions.context;
      else route.context = Utils.extend({}, route.context, resolveOptions.context);
      options.route.context = route.context;
    }
    router.loadBack(resolveParams, Utils.extend(options, resolveOptions), true);
  }
  function asyncReject() {
    router.allowPageChange = true;
  }
  if (route.route.async) {
    router.allowPageChange = false;

    route.route.async.call(router, route, router.currentRoute, asyncResolve, asyncReject);
  }
  // Return Router
  return router;
}

function clearPreviousHistory() {
  const router = this;
  const app = router.app;
  const separateNavbar = router.separateNavbar;
  const url = router.history[router.history.length - 1];

  const $currentPageEl = $(router.currentPageEl);

  const $pagesToRemove = router.$el
    .children('.page:not(.stacked)')
    .filter((index, pageInView) => pageInView !== $currentPageEl[0]);

  $pagesToRemove.each((index, pageEl) => {
    const $oldPageEl = $(pageEl);
    const $oldNavbarInnerEl = $(app.navbar.getElByPage($oldPageEl));
    if (router.params.stackPages && router.initialPages.indexOf($oldPageEl[0]) >= 0) {
      $oldPageEl.addClass('stacked');
      if (separateNavbar) {
        $oldNavbarInnerEl.addClass('stacked');
      }
    } else {
      // Page remove event
      router.pageCallback('beforeRemove', $oldPageEl, $oldNavbarInnerEl, 'previous', undefined, {});
      router.removePage($oldPageEl);
      if (separateNavbar && $oldNavbarInnerEl.length) {
        router.removeNavbar($oldNavbarInnerEl);
      }
    }
  });

  router.history = [url];
  router.view.history = [url];
  router.saveHistory();
}

class Router extends Framework7Class {
  constructor(app, view) {
    super({}, [typeof view === 'undefined' ? app : view]);
    const router = this;

    // Is App Router
    router.isAppRouter = typeof view === 'undefined';

    if (router.isAppRouter) {
      // App Router
      Utils.extend(false, router, {
        app,
        params: app.params.view,
        routes: app.routes || [],
        cache: app.cache,
      });
    } else {
      // View Router
      Utils.extend(false, router, {
        app,
        view,
        viewId: view.id,
        params: view.params,
        routes: view.routes,
        $el: view.$el,
        el: view.el,
        $navbarEl: view.$navbarEl,
        navbarEl: view.navbarEl,
        history: view.history,
        scrollHistory: view.scrollHistory,
        cache: app.cache,
        dynamicNavbar: app.theme === 'ios' && view.params.iosDynamicNavbar,
        separateNavbar: app.theme === 'ios' && view.params.iosDynamicNavbar && view.params.iosSeparateDynamicNavbar,
        initialPages: [],
        initialNavbars: [],
      });
    }

    // Install Modules
    router.useModules();

    // Temporary Dom
    router.tempDom = document.createElement('div');

    // AllowPageChage
    router.allowPageChange = true;

    // Current Route
    let currentRoute = {};
    let previousRoute = {};
    Object.defineProperty(router, 'currentRoute', {
      enumerable: true,
      configurable: true,
      set(newRoute = {}) {
        previousRoute = Utils.extend({}, currentRoute);
        currentRoute = newRoute;
        if (!currentRoute) return;
        router.url = currentRoute.url;
        router.emit('routeChange', newRoute, previousRoute, router);
      },
      get() {
        return currentRoute;
      },
    });
    Object.defineProperty(router, 'previousRoute', {
      enumerable: true,
      configurable: true,
      get() {
        return previousRoute;
      },
      set(newRoute) {
        previousRoute = newRoute;
      },
    });

    Utils.extend(router, {
      // Load
      forward,
      load,
      navigate,
      refreshPage,
      // Tab
      tabLoad,
      tabRemove,
      // Modal
      modalLoad,
      modalRemove,
      // Back
      backward,
      loadBack,
      back,
      // Clear history
      clearPreviousHistory,
    });

    return router;
  }
  animatableNavElements(newNavbarInner, oldNavbarInner) {
    const router = this;
    const dynamicNavbar = router.dynamicNavbar;
    const animateIcon = router.params.iosAnimateNavbarBackIcon;

    let newNavEls;
    let oldNavEls;
    function animatableNavEl(el, navbarInner) {
      const $el = $(el);
      const isSliding = $el.hasClass('sliding') || navbarInner.hasClass('sliding');
      const isSubnavbar = $el.hasClass('subnavbar');
      const needsOpacityTransition = isSliding ? !isSubnavbar : true;
      const hasIcon = isSliding && animateIcon && $el.hasClass('left') && $el.find('.back .icon').length > 0;
      let $iconEl;
      if (hasIcon) $iconEl = $el.find('.back .icon');
      return {
        $el,
        $iconEl,
        hasIcon,
        leftOffset: $el[0].f7NavbarLeftOffset,
        rightOffset: $el[0].f7NavbarRightOffset,
        isSliding,
        isSubnavbar,
        needsOpacityTransition,
      };
    }
    if (dynamicNavbar) {
      newNavEls = [];
      oldNavEls = [];
      newNavbarInner.children('.left, .right, .title, .subnavbar').each((index, navEl) => {
        newNavEls.push(animatableNavEl(navEl, newNavbarInner));
      });
      oldNavbarInner.children('.left, .right, .title, .subnavbar').each((index, navEl) => {
        oldNavEls.push(animatableNavEl(navEl, oldNavbarInner));
      });
      [oldNavEls, newNavEls].forEach((navEls) => {
        navEls.forEach((navEl) => {
          const n = navEl;
          const { isSliding, $el } = navEl;
          const otherEls = navEls === oldNavEls ? newNavEls : oldNavEls;
          if (!(isSliding && $el.hasClass('title') && otherEls)) return;
          otherEls.forEach((otherNavEl) => {
            if (otherNavEl.$el.hasClass('left') && otherNavEl.hasIcon) {
              const iconTextEl = otherNavEl.$el.find('.back span')[0];
              n.leftOffset += iconTextEl ? iconTextEl.offsetLeft : 0;
            }
          });
        });
      });
    }

    return { newNavEls, oldNavEls };
  }
  animateWithCSS(oldPage, newPage, oldNavbarInner, newNavbarInner, direction, callback) {
    const router = this;
    const dynamicNavbar = router.dynamicNavbar;
    const separateNavbar = router.separateNavbar;
    const ios = router.app.theme === 'ios';
    // Router Animation class
    const routerTransitionClass = `router-transition-${direction} router-transition-css-${direction}`;

    let newNavEls;
    let oldNavEls;
    let navbarWidth = 0;

    if (ios && dynamicNavbar) {
      if (!separateNavbar) {
        navbarWidth = newNavbarInner[0].offsetWidth;
      }
      const navEls = router.animatableNavElements(newNavbarInner, oldNavbarInner);
      newNavEls = navEls.newNavEls;
      oldNavEls = navEls.oldNavEls;
    }

    function animateNavbars(progress) {
      if (ios && dynamicNavbar) {
        newNavEls.forEach((navEl) => {
          const $el = navEl.$el;
          const offset = direction === 'forward' ? navEl.rightOffset : navEl.leftOffset;
          if (navEl.isSliding) {
            $el.transform(`translate3d(${offset * (1 - progress)}px,0,0)`);
          }
          if (navEl.hasIcon) {
            if (direction === 'forward') {
              navEl.$iconEl.transform(`translate3d(${(-offset - navbarWidth) * (1 - progress)}px,0,0)`);
            } else {
              navEl.$iconEl.transform(`translate3d(${(-offset + (navbarWidth / 5)) * (1 - progress)}px,0,0)`);
            }
          }
        });
        oldNavEls.forEach((navEl) => {
          const $el = navEl.$el;
          const offset = direction === 'forward' ? navEl.leftOffset : navEl.rightOffset;
          if (navEl.isSliding) {
            $el.transform(`translate3d(${offset * (progress)}px,0,0)`);
          }
          if (navEl.hasIcon) {
            if (direction === 'forward') {
              navEl.$iconEl.transform(`translate3d(${(-offset + (navbarWidth / 5)) * (progress)}px,0,0)`);
            } else {
              navEl.$iconEl.transform(`translate3d(${(-offset - navbarWidth) * (progress)}px,0,0)`);
            }
          }
        });
      }
    }

    // AnimationEnd Callback
    function onDone() {
      if (router.dynamicNavbar) {
        if (newNavbarInner.hasClass('sliding')) {
          newNavbarInner.find('.title, .left, .right, .left .icon, .subnavbar').transform('');
        } else {
          newNavbarInner.find('.sliding').transform('');
        }
        if (oldNavbarInner.hasClass('sliding')) {
          oldNavbarInner.find('.title, .left, .right, .left .icon, .subnavbar').transform('');
        } else {
          oldNavbarInner.find('.sliding').transform('');
        }
      }
      router.$el.removeClass(routerTransitionClass);
      if (callback) callback();
    }

    (direction === 'forward' ? newPage : oldPage).animationEnd(() => {
      onDone();
    });

    // Animate
    if (dynamicNavbar) {
      // Prepare Navbars
      animateNavbars(0);
      Utils.nextTick(() => {
        // Add class, start animation
        animateNavbars(1);
        router.$el.addClass(routerTransitionClass);
      });
    } else {
      // Add class, start animation
      router.$el.addClass(routerTransitionClass);
    }
  }
  animateWithJS(oldPage, newPage, oldNavbarInner, newNavbarInner, direction, callback) {
    const router = this;
    const dynamicNavbar = router.dynamicNavbar;
    const separateNavbar = router.separateNavbar;
    const ios = router.app.theme === 'ios';
    const duration = ios ? 400 : 250;
    const routerTransitionClass = `router-transition-${direction} router-transition-js-${direction}`;

    let startTime = null;
    let done = false;

    let newNavEls;
    let oldNavEls;
    let navbarWidth = 0;

    if (ios && dynamicNavbar) {
      if (!separateNavbar) {
        navbarWidth = newNavbarInner[0].offsetWidth;
      }
      const navEls = router.animatableNavElements(newNavbarInner, oldNavbarInner);
      newNavEls = navEls.newNavEls;
      oldNavEls = navEls.oldNavEls;
    }

    let $shadowEl;
    let $opacityEl;

    if (ios) {
      $shadowEl = $('<div class="page-shadow-effect"></div>');
      $opacityEl = $('<div class="page-opacity-effect"></div>');

      if (direction === 'forward') {
        newPage.append($shadowEl);
        oldPage.append($opacityEl);
      } else {
        newPage.append($opacityEl);
        oldPage.append($shadowEl);
      }
    }
    const easing = Utils.bezier(0.25, 0.1, 0.25, 1);

    function onDone() {
      newPage.transform('').css('opacity', '');
      oldPage.transform('').css('opacity', '');
      if (ios) {
        $shadowEl.remove();
        $opacityEl.remove();
        if (dynamicNavbar) {
          newNavEls.forEach((navEl) => {
            navEl.$el.transform('');
            navEl.$el.css('opacity', '');
          });
          oldNavEls.forEach((navEl) => {
            navEl.$el.transform('');
            navEl.$el.css('opacity', '');
          });
          newNavEls = [];
          oldNavEls = [];
        }
      }

      router.$el.removeClass(routerTransitionClass);

      if (callback) callback();
    }

    function render() {
      const time = Utils.now();
      if (!startTime) startTime = time;
      const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
      const easeProgress = easing(progress);

      if (progress >= 1) {
        done = true;
      }
      const inverter = router.app.rtl ? -1 : 1;
      if (ios) {
        if (direction === 'forward') {
          newPage.transform(`translate3d(${(1 - easeProgress) * 100 * inverter}%,0,0)`);
          oldPage.transform(`translate3d(${-easeProgress * 20 * inverter}%,0,0)`);
          $shadowEl[0].style.opacity = easeProgress;
          $opacityEl[0].style.opacity = easeProgress;
        } else {
          newPage.transform(`translate3d(${-(1 - easeProgress) * 20 * inverter}%,0,0)`);
          oldPage.transform(`translate3d(${easeProgress * 100 * inverter}%,0,0)`);
          $shadowEl[0].style.opacity = 1 - easeProgress;
          $opacityEl[0].style.opacity = 1 - easeProgress;
        }
        if (dynamicNavbar) {
          newNavEls.forEach((navEl) => {
            const $el = navEl.$el;
            const offset = direction === 'forward' ? navEl.rightOffset : navEl.leftOffset;
            if (navEl.needsOpacityTransition) {
              $el[0].style.opacity = easeProgress;
            }
            if (navEl.isSliding) {
              $el.transform(`translate3d(${offset * (1 - easeProgress)}px,0,0)`);
            }
            if (navEl.hasIcon) {
              if (direction === 'forward') {
                navEl.$iconEl.transform(`translate3d(${(-offset - navbarWidth) * (1 - easeProgress)}px,0,0)`);
              } else {
                navEl.$iconEl.transform(`translate3d(${(-offset + (navbarWidth / 5)) * (1 - easeProgress)}px,0,0)`);
              }
            }
          });
          oldNavEls.forEach((navEl) => {
            const $el = navEl.$el;
            const offset = direction === 'forward' ? navEl.leftOffset : navEl.rightOffset;
            if (navEl.needsOpacityTransition) {
              $el[0].style.opacity = (1 - easeProgress);
            }
            if (navEl.isSliding) {
              $el.transform(`translate3d(${offset * (easeProgress)}px,0,0)`);
            }
            if (navEl.hasIcon) {
              if (direction === 'forward') {
                navEl.$iconEl.transform(`translate3d(${(-offset + (navbarWidth / 5)) * (easeProgress)}px,0,0)`);
              } else {
                navEl.$iconEl.transform(`translate3d(${(-offset - navbarWidth) * (easeProgress)}px,0,0)`);
              }
            }
          });
        }
      } else if (direction === 'forward') {
        newPage.transform(`translate3d(0, ${(1 - easeProgress) * 56}px,0)`);
        newPage.css('opacity', easeProgress);
      } else {
        oldPage.transform(`translate3d(0, ${easeProgress * 56}px,0)`);
        oldPage.css('opacity', 1 - easeProgress);
      }

      if (done) {
        onDone();
        return;
      }
      Utils.nextFrame(render);
    }

    router.$el.addClass(routerTransitionClass);

    Utils.nextFrame(render);
  }
  animate(...args) {
    // Args: oldPage, newPage, oldNavbarInner, newNavbarInner, direction, callback
    const router = this;
    if (router.params.animateCustom) {
      router.params.animateCustom.apply(router, args);
    } else if (router.params.animateWithJS) {
      router.animateWithJS(...args);
    } else {
      router.animateWithCSS(...args);
    }
  }
  removeModal(modalEl) {
    const router = this;
    router.removeEl(modalEl);
  }
  // eslint-disable-next-line
  removeTabContent(tabEl) {
    const $tabEl = $(tabEl);
    $tabEl.html('');
  }
  removeNavbar(el) {
    const router = this;
    router.removeEl(el);
  }
  removePage(el) {
    const router = this;
    router.removeEl(el);
  }
  removeEl(el) {
    if (!el) return;
    const router = this;
    const $el = $(el);
    if ($el.length === 0) return;
    if ($el[0].f7Component && $el[0].f7Component.$destroy) {
      $el[0].f7Component.$destroy();
    }
    $el.find('.tab').each((tabIndex, tabEl) => {
      $(tabEl).children().each((index, tabChild) => {
        if (tabChild.f7Component) {
          $(tabChild).trigger('tab:beforeremove');
          tabChild.f7Component.$destroy();
        }
      });
    });
    if (!router.params.removeElements) {
      return;
    }
    if (router.params.removeElementsWithTimeout) {
      setTimeout(() => {
        $el.remove();
      }, router.params.removeElementsTimeout);
    } else {
      $el.remove();
    }
  }
  getPageEl(content) {
    const router = this;
    if (typeof content === 'string') {
      router.tempDom.innerHTML = content;
    } else {
      if ($(content).hasClass('page')) {
        return content;
      }
      router.tempDom.innerHTML = '';
      $(router.tempDom).append(content);
    }

    return router.findElement('.page', router.tempDom);
  }
  findElement(stringSelector, container, notStacked) {
    const router = this;
    const view = router.view;
    const app = router.app;

    // Modals Selector
    const modalsSelector = '.popup, .dialog, .popover, .actions-modal, .sheet-modal, .login-screen, .page';

    const $container = $(container);
    let selector = stringSelector;
    if (notStacked) selector += ':not(.stacked)';

    let found = $container
      .find(selector)
      .filter((index, el) => $(el).parents(modalsSelector).length === 0);

    if (found.length > 1) {
      if (typeof view.selector === 'string') {
        // Search in related view
        found = $container.find(`${view.selector} ${selector}`);
      }
      if (found.length > 1) {
        // Search in main view
        found = $container.find(`.${app.params.viewMainClass} ${selector}`);
      }
    }
    if (found.length === 1) return found;

    // Try to find not stacked
    if (!notStacked) found = router.findElement(selector, $container, true);
    if (found && found.length === 1) return found;
    if (found && found.length > 1) return $(found[0]);
    return undefined;
  }
  flattenRoutes(routes = this.routes) {
    let flattenedRoutes = [];
    routes.forEach((route) => {
      if ('routes' in route) {
        const mergedPathsRoutes = route.routes.map((childRoute) => {
          const cRoute = Utils.extend({}, childRoute);
          cRoute.path = (`${route.path}/${cRoute.path}`).replace('///', '/').replace('//', '/');
          return cRoute;
        });
        flattenedRoutes = flattenedRoutes.concat(route, this.flattenRoutes(mergedPathsRoutes));
      } else if ('tabs' in route && route.tabs) {
        const mergedPathsRoutes = route.tabs.map((tabRoute) => {
          const tRoute = Utils.extend({}, route, {
            path: (`${route.path}/${tabRoute.path}`).replace('///', '/').replace('//', '/'),
            parentPath: route.path,
            tab: tabRoute,
          });
          delete tRoute.tabs;
          return tRoute;
        });
        flattenedRoutes = flattenedRoutes.concat(this.flattenRoutes(mergedPathsRoutes));
      } else {
        flattenedRoutes.push(route);
      }
    });
    return flattenedRoutes;
  }
  // eslint-disable-next-line
  parseRouteUrl(url) {
    if (!url) return {};
    const query = Utils.parseUrlQuery(url);
    const hash = url.split('#')[1];
    const params = {};
    const path = url.split('#')[0].split('?')[0];
    return {
      query,
      hash,
      params,
      url,
      path,
    };
  }
  findTabRoute(tabEl) {
    const router = this;
    const $tabEl = $(tabEl);
    const parentPath = router.currentRoute.route.parentPath;
    const tabId = $tabEl.attr('id');
    const flattenedRoutes = router.flattenRoutes(router.routes);
    let foundTabRoute;
    flattenedRoutes.forEach((route) => {
      if (
        route.parentPath === parentPath &&
        route.tab &&
        route.tab.id === tabId
      ) {
        foundTabRoute = route;
      }
    });
    return foundTabRoute;
  }
  findRouteByKey(key, value) {
    const router = this;
    const routes = router.routes;
    const flattenedRoutes = router.flattenRoutes(routes);
    let matchingRoute;

    flattenedRoutes.forEach((route) => {
      if (matchingRoute) return;
      if (route[key] === value) {
        matchingRoute = route;
      }
    });
    return matchingRoute;
  }
  findMatchingRoute(url) {
    if (!url) return undefined;
    const router = this;
    const routes = router.routes;
    const flattenedRoutes = router.flattenRoutes(routes);
    const { path, query, hash, params } = router.parseRouteUrl(url);
    let matchingRoute;
    flattenedRoutes.forEach((route) => {
      if (matchingRoute) return;
      const keys = [];

      const pathsToMatch = [route.path];
      if (route.alias) {
        if (typeof route.alias === 'string') pathsToMatch.push(route.alias);
        else if (Array.isArray(route.alias)) {
          route.alias.forEach((aliasPath) => {
            pathsToMatch.push(aliasPath);
          });
        }
      }

      let matched;
      pathsToMatch.forEach((pathToMatch) => {
        if (matched) return;
        matched = PathToRegexp(pathToMatch, keys).exec(path);
      });

      if (matched) {
        keys.forEach((keyObj, index) => {
          const paramValue = matched[index + 1];
          params[keyObj.name] = paramValue;
        });

        let parentPath;
        if (route.parentPath) {
          parentPath = path.split('/').slice(0, route.parentPath.split('/').length - 1).join('/');
        }

        matchingRoute = {
          query,
          hash,
          params,
          url,
          path,
          parentPath,
          route,
          name: route.name,
        };
      }
    });
    return matchingRoute;
  }
  removeFromXhrCache(url) {
    const router = this;
    const xhrCache = router.cache.xhr;
    let index = false;
    for (let i = 0; i < xhrCache.length; i += 1) {
      if (xhrCache[i].url === url) index = i;
    }
    if (index !== false) xhrCache.splice(index, 1);
  }
  xhrRequest(requestUrl, options) {
    const router = this;
    const params = router.params;
    const { ignoreCache } = options;
    let url = requestUrl;

    let hasQuery = url.indexOf('?') >= 0;
    if (params.passRouteQueryToRequest &&
      options &&
      options.route &&
      options.route.query &&
      Object.keys(options.route.query).length
    ) {
      url += `${hasQuery ? '&' : '?'}${Utils.serializeObject(options.route.query)}`;
      hasQuery = true;
    }

    if (params.passRouteParamsToRequest &&
      options &&
      options.route &&
      options.route.params &&
      Object.keys(options.route.params).length
    ) {
      url += `${hasQuery ? '&' : '?'}${Utils.serializeObject(options.route.params)}`;
      hasQuery = true;
    }

    if (url.indexOf('{{') >= 0 &&
      options &&
      options.route &&
      options.route.params &&
      Object.keys(options.route.params).length
    ) {
      Object.keys(options.route.params).forEach((paramName) => {
        const regExp = new RegExp(`{{${paramName}}}`, 'g');
        url = url.replace(regExp, options.route.params[paramName] || '');
      });
    }
    // should we ignore get params or not
    if (params.xhrCacheIgnoreGetParameters && url.indexOf('?') >= 0) {
      url = url.split('?')[0];
    }
    return Utils.promise((resolve, reject) => {
      if (params.xhrCache && !ignoreCache && url.indexOf('nocache') < 0 && params.xhrCacheIgnore.indexOf(url) < 0) {
        for (let i = 0; i < router.cache.xhr.length; i += 1) {
          const cachedUrl = router.cache.xhr[i];
          if (cachedUrl.url === url) {
            // Check expiration
            if (Utils.now() - cachedUrl.time < params.xhrCacheDuration) {
              // Load from cache
              resolve(cachedUrl.content);
              return;
            }
          }
        }
      }
      router.xhr = router.app.request({
        url,
        method: 'GET',
        beforeSend(xhr) {
          router.emit('routerAjaxStart', xhr, options);
        },
        complete(xhr, status) {
          router.emit('routerAjaxComplete', xhr);
          if ((status !== 'error' && status !== 'timeout' && (xhr.status >= 200 && xhr.status < 300)) || xhr.status === 0) {
            if (params.xhrCache && xhr.responseText !== '') {
              router.removeFromXhrCache(url);
              router.cache.xhr.push({
                url,
                time: Utils.now(),
                content: xhr.responseText,
              });
            }
            router.emit('routerAjaxSuccess', xhr, options);
            resolve(xhr.responseText);
          } else {
            router.emit('routerAjaxError', xhr, options);
            reject(xhr);
          }
        },
        error(xhr) {
          router.emit('routerAjaxError', xhr, options);
          reject(xhr);
        },
      });
    });
  }
  // Remove theme elements
  removeThemeElements(el) {
    const router = this;
    const theme = router.app.theme;
    $(el).find(`.${theme === 'md' ? 'ios' : 'md'}-only, .if-${theme === 'md' ? 'ios' : 'md'}`).remove();
  }
  templateLoader(template, templateUrl, options, resolve, reject) {
    const router = this;
    function compile(t) {
      let compiledHtml;
      let context;
      try {
        context = options.context || {};
        if (typeof context === 'function') context = context.call(router);
        else if (typeof context === 'string') {
          try {
            context = JSON.parse(context);
          } catch (err) {
            reject();
            throw (err);
          }
        }
        if (typeof t === 'function') {
          compiledHtml = t(context);
        } else {
          compiledHtml = Template7.compile(t)(Utils.extend({}, context || {}, {
            $app: router.app,
            $root: Utils.extend({}, router.app.data, router.app.methods),
            $route: options.route,
            $router: router,
            $theme: {
              ios: router.app.theme === 'ios',
              md: router.app.theme === 'md',
            },
          }));
        }
      } catch (err) {
        reject();
        throw (err);
      }
      resolve(compiledHtml, { context });
    }
    if (templateUrl) {
      // Load via XHR
      if (router.xhr) {
        router.xhr.abort();
        router.xhr = false;
      }
      router
        .xhrRequest(templateUrl, options)
        .then((templateContent) => {
          compile(templateContent);
        })
        .catch(() => {
          reject();
        });
    } else {
      compile(template);
    }
  }
  modalTemplateLoader(template, templateUrl, options, resolve, reject) {
    const router = this;
    return router.templateLoader(template, templateUrl, options, (html) => {
      resolve(html);
    }, reject);
  }
  tabTemplateLoader(template, templateUrl, options, resolve, reject) {
    const router = this;
    return router.templateLoader(template, templateUrl, options, (html) => {
      resolve(html);
    }, reject);
  }
  pageTemplateLoader(template, templateUrl, options, resolve, reject) {
    const router = this;
    return router.templateLoader(template, templateUrl, options, (html, newOptions = {}) => {
      resolve(router.getPageEl(html), newOptions);
    }, reject);
  }
  componentLoader(component, componentUrl, options = {}, resolve, reject) {
    const router = this;
    const url = typeof component === 'string' ? component : componentUrl;
    function compile(c) {
      let context = options.context || {};
      if (typeof context === 'function') context = context.call(router);
      else if (typeof context === 'string') {
        try {
          context = JSON.parse(context);
        } catch (err) {
          reject();
          throw (err);
        }
      }
      const extendContext = Utils.merge(
        {},
        context,
        {
          $,
          $$: $,
          $app: router.app,
          $root: Utils.merge({}, router.app.data, router.app.methods),
          $route: options.route,
          $router: router,
          $dom7: $,
          $theme: {
            ios: router.app.theme === 'ios',
            md: router.app.theme === 'md',
          },
        }
      );
      const createdComponent = Component.create(c, extendContext);
      resolve(createdComponent.el);
    }
    if (url) {
      // Load via XHR
      if (router.xhr) {
        router.xhr.abort();
        router.xhr = false;
      }
      router
        .xhrRequest(url, options)
        .then((loadedComponent) => {
          compile(Component.parse(loadedComponent));
        })
        .catch((err) => {
          reject();
          throw (err);
        });
    } else {
      compile(component);
    }
  }
  modalComponentLoader(rootEl, component, componentUrl, options, resolve, reject) {
    const router = this;
    router.componentLoader(component, componentUrl, options, (el) => {
      resolve(el);
    }, reject);
  }
  tabComponentLoader(tabEl, component, componentUrl, options, resolve, reject) {
    const router = this;
    router.componentLoader(component, componentUrl, options, (el) => {
      resolve(el);
    }, reject);
  }
  pageComponentLoader(routerEl, component, componentUrl, options, resolve, reject) {
    const router = this;
    router.componentLoader(component, componentUrl, options, (el, newOptions = {}) => {
      resolve(el, newOptions);
    }, reject);
  }
  getPageData(pageEl, navbarEl, from, to, route = {}, pageFromEl) {
    const router = this;
    const $pageEl = $(pageEl);
    const $navbarEl = $(navbarEl);
    const currentPage = $pageEl[0].f7Page || {};
    let direction;
    let pageFrom;
    if ((from === 'next' && to === 'current') || (from === 'current' && to === 'previous')) direction = 'forward';
    if ((from === 'current' && to === 'next') || (from === 'previous' && to === 'current')) direction = 'backward';
    if (currentPage && !currentPage.fromPage) {
      const $pageFromEl = $(pageFromEl);
      if ($pageFromEl.length) {
        pageFrom = $pageFromEl[0].f7Page;
      }
    }
    pageFrom = currentPage.pageFrom || pageFrom;
    if (pageFrom && pageFrom.pageFrom) {
      pageFrom.pageFrom = null;
    }
    const page = {
      app: router.app,
      view: router.view,
      router,
      $el: $pageEl,
      el: $pageEl[0],
      $pageEl,
      pageEl: $pageEl[0],
      $navbarEl,
      navbarEl: $navbarEl[0],
      name: $pageEl.attr('data-name'),
      position: from,
      from,
      to,
      direction,
      route: currentPage.route ? currentPage.route : route,
      pageFrom,
    };

    if ($navbarEl && $navbarEl[0]) {
      $navbarEl[0].f7Page = page;
    }
    $pageEl[0].f7Page = page;
    return page;
  }
  // Callbacks
  pageCallback(callback, pageEl, navbarEl, from, to, options = {}, pageFromEl) {
    if (!pageEl) return;
    const router = this;
    const $pageEl = $(pageEl);
    if (!$pageEl.length) return;
    const { route } = options;
    const restoreScrollTopOnBack = router.params.restoreScrollTopOnBack;

    const camelName = `page${callback[0].toUpperCase() + callback.slice(1, callback.length)}`;
    const colonName = `page:${callback.toLowerCase()}`;

    let page = {};
    if (callback === 'beforeRemove' && $pageEl[0].f7Page) {
      page = Utils.extend($pageEl[0].f7Page, { from, to, position: from });
    } else {
      page = router.getPageData(pageEl, navbarEl, from, to, route, pageFromEl);
    }
    page.swipeBack = !!options.swipeBack;

    const { on = {}, once = {} } = options.route ? options.route.route : {};
    if (options.on) {
      Utils.extend(on, options.on);
    }
    if (options.once) {
      Utils.extend(once, options.once);
    }

    function attachEvents() {
      if ($pageEl[0].f7RouteEventsAttached) return;
      $pageEl[0].f7RouteEventsAttached = true;
      if (on && Object.keys(on).length > 0) {
        $pageEl[0].f7RouteEventsOn = on;
        Object.keys(on).forEach((eventName) => {
          on[eventName] = on[eventName].bind(router);
          $pageEl.on(Utils.eventNameToColonCase(eventName), on[eventName]);
        });
      }
      if (once && Object.keys(once).length > 0) {
        $pageEl[0].f7RouteEventsOnce = once;
        Object.keys(once).forEach((eventName) => {
          once[eventName] = once[eventName].bind(router);
          $pageEl.once(Utils.eventNameToColonCase(eventName), once[eventName]);
        });
      }
    }

    function detachEvents() {
      if (!$pageEl[0].f7RouteEventsAttached) return;
      if ($pageEl[0].f7RouteEventsOn) {
        Object.keys($pageEl[0].f7RouteEventsOn).forEach((eventName) => {
          $pageEl.off(Utils.eventNameToColonCase(eventName), $pageEl[0].f7RouteEventsOn[eventName]);
        });
      }
      if ($pageEl[0].f7RouteEventsOnce) {
        Object.keys($pageEl[0].f7RouteEventsOnce).forEach((eventName) => {
          $pageEl.off(Utils.eventNameToColonCase(eventName), $pageEl[0].f7RouteEventsOnce[eventName]);
        });
      }
      $pageEl[0].f7RouteEventsAttached = null;
      $pageEl[0].f7RouteEventsOn = null;
      $pageEl[0].f7RouteEventsOnce = null;
      delete $pageEl[0].f7RouteEventsAttached;
      delete $pageEl[0].f7RouteEventsOn;
      delete $pageEl[0].f7RouteEventsOnce;
    }

    if (callback === 'mounted') {
      attachEvents();
    }
    if (callback === 'init') {
      if (restoreScrollTopOnBack && (from === 'previous' || !from) && to === 'current' && router.scrollHistory[page.route.url] && !$pageEl.hasClass('no-restore-scroll')) {
        let $pageContent = $pageEl.find('.page-content');
        if ($pageContent.length > 0) {
          // eslint-disable-next-line
          $pageContent = $pageContent.filter((pageContentIndex, pageContentEl) => {
            return (
              $(pageContentEl).parents('.tab:not(.tab-active)').length === 0 &&
              !$(pageContentEl).is('.tab:not(.tab-active)')
            );
          });
        }
        $pageContent.scrollTop(router.scrollHistory[page.route.url]);
      }
      attachEvents();
      if ($pageEl[0].f7PageInitialized) {
        $pageEl.trigger('page:reinit', page);
        router.emit('pageReinit', page);
        return;
      }
      $pageEl[0].f7PageInitialized = true;
    }
    if (restoreScrollTopOnBack && callback === 'beforeOut' && from === 'current' && to === 'previous') {
      // Save scroll position
      let $pageContent = $pageEl.find('.page-content');
      if ($pageContent.length > 0) {
        // eslint-disable-next-line
        $pageContent = $pageContent.filter((pageContentIndex, pageContentEl) => {
          return (
            $(pageContentEl).parents('.tab:not(.tab-active)').length === 0 &&
            !$(pageContentEl).is('.tab:not(.tab-active)')
          );
        });
      }
      router.scrollHistory[page.route.url] = $pageContent.scrollTop();
    }
    if (restoreScrollTopOnBack && callback === 'beforeOut' && from === 'current' && to === 'next') {
      // Delete scroll position
      delete router.scrollHistory[page.route.url];
    }

    $pageEl.trigger(colonName, page);
    router.emit(camelName, page);

    if (callback === 'beforeRemove') {
      detachEvents();
      $pageEl[0].f7Page = null;
    }
  }
  saveHistory() {
    const router = this;
    router.view.history = router.history;
    if (router.params.pushState) {
      window$1.localStorage[`f7router-${router.view.id}-history`] = JSON.stringify(router.history);
    }
  }
  restoreHistory() {
    const router = this;
    if (router.params.pushState && window$1.localStorage[`f7router-${router.view.id}-history`]) {
      router.history = JSON.parse(window$1.localStorage[`f7router-${router.view.id}-history`]);
      router.view.history = router.history;
    }
  }
  clearHistory() {
    const router = this;
    router.history = [];
    if (router.view) router.view.history = [];
    router.saveHistory();
  }
  init() {
    const router = this;
    const { app, view } = router;

    // Init Swipeback
    {
      if (
        (view && router.params.iosSwipeBack && app.theme === 'ios') ||
        (view && router.params.mdSwipeBack && app.theme === 'md')
      ) {
        SwipeBack(router);
      }
    }

    // Dynamic not separated navbbar
    if (router.dynamicNavbar && !router.separateNavbar) {
      router.$el.addClass('router-dynamic-navbar-inside');
    }

    let initUrl = router.params.url;
    let documentUrl = document.location.href.split(document.location.origin)[1];
    let historyRestored;
    if (!router.params.pushState || !router.params.pushStateOnLoad) {
      if (!initUrl) {
        initUrl = documentUrl;
      }
      if (document.location.search && initUrl.indexOf('?') < 0) {
        initUrl += document.location.search;
      }
      if (document.location.hash && initUrl.indexOf('#') < 0) {
        initUrl += document.location.hash;
      }
    } else {
      if (router.params.pushStateRoot && documentUrl.indexOf(router.params.pushStateRoot) >= 0) {
        documentUrl = documentUrl.split(router.params.pushStateRoot)[1];
        if (documentUrl === '') documentUrl = '/';
      }
      if (router.params.pushStateSeparator.length > 0 && documentUrl.indexOf(router.params.pushStateSeparator) >= 0) {
        initUrl = documentUrl.split(router.params.pushStateSeparator)[1];
      } else {
        initUrl = documentUrl;
      }
      router.restoreHistory();
      if (router.history.indexOf(initUrl) >= 0) {
        router.history = router.history.slice(0, router.history.indexOf(initUrl) + 1);
      } else if (router.params.url === initUrl) {
        router.history = [initUrl];
      } else if (History.state && History.state[view.id] && History.state[view.id].url === router.history[router.history.length - 1]) {
        initUrl = router.history[router.history.length - 1];
      } else {
        router.history = [documentUrl.split(router.params.pushStateSeparator)[0] || '/', initUrl];
      }
      if (router.history.length > 1) {
        historyRestored = true;
      } else {
        router.history = [];
      }
      router.saveHistory();
    }
    let currentRoute;
    if (router.history.length > 1) {
      // Will load page
      currentRoute = router.findMatchingRoute(router.history[0]);
      if (!currentRoute) {
        currentRoute = Utils.extend(router.parseRouteUrl(router.history[0]), {
          route: {
            url: router.history[0],
            path: router.history[0].split('?')[0],
          },
        });
      }
    } else {
      // Don't load page
      currentRoute = router.findMatchingRoute(initUrl);
      if (!currentRoute) {
        currentRoute = Utils.extend(router.parseRouteUrl(initUrl), {
          route: {
            url: initUrl,
            path: initUrl.split('?')[0],
          },
        });
      }
    }

    if (router.params.stackPages) {
      router.$el.children('.page').each((index, pageEl) => {
        const $pageEl = $(pageEl);
        router.initialPages.push($pageEl[0]);
        if (router.separateNavbar && $pageEl.children('.navbar').length > 0) {
          router.initialNavbars.push($pageEl.children('.navbar').find('.navbar-inner')[0]);
        }
      });
    }

    if (router.$el.children('.page:not(.stacked)').length === 0 && initUrl) {
      // No pages presented in DOM, reload new page
      router.navigate(initUrl, {
        initial: true,
        reloadCurrent: true,
        pushState: false,
      });
    } else {
      // Init current DOM page
      let hasTabRoute;
      router.currentRoute = currentRoute;
      router.$el.children('.page:not(.stacked)').each((index, pageEl) => {
        const $pageEl = $(pageEl);
        let $navbarInnerEl;
        $pageEl.addClass('page-current');
        if (router.separateNavbar) {
          $navbarInnerEl = $pageEl.children('.navbar').children('.navbar-inner');
          if ($navbarInnerEl.length > 0) {
            if (!router.$navbarEl.parents(document).length) {
              router.$el.prepend(router.$navbarEl);
            }
            router.$navbarEl.append($navbarInnerEl);
            $pageEl.children('.navbar').remove();
          } else {
            router.$navbarEl.addClass('navbar-hidden');
          }
        }
        const initOptions = {
          route: router.currentRoute,
        };
        if (router.currentRoute && router.currentRoute.route && router.currentRoute.route.options) {
          Utils.extend(initOptions, router.currentRoute.route.options);
        }
        router.currentPageEl = $pageEl[0];
        if (router.dynamicNavbar && $navbarInnerEl.length) {
          router.currentNavbarEl = $navbarInnerEl[0];
        }
        router.removeThemeElements($pageEl);
        if (router.dynamicNavbar && $navbarInnerEl.length) {
          router.removeThemeElements($navbarInnerEl);
        }
        if (initOptions.route.route.tab) {
          hasTabRoute = true;
          router.tabLoad(initOptions.route.route.tab, Utils.extend({}, initOptions));
        }
        router.pageCallback('init', $pageEl, $navbarInnerEl, 'current', undefined, initOptions);
      });
      if (historyRestored) {
        router.navigate(initUrl, {
          initial: true,
          pushState: false,
          history: false,
          animate: router.params.pushStateAnimateOnLoad,
          once: {
            pageAfterIn() {
              if (router.history.length > 2) {
                router.back({ preload: true });
              }
            },
          },
        });
      }
      if (!historyRestored && !hasTabRoute) {
        router.history.push(initUrl);
        router.saveHistory();
      }
    }
    if (initUrl && router.params.pushState && router.params.pushStateOnLoad && (!History.state || !History.state[view.id])) {
      History.initViewState(view.id, {
        url: initUrl,
      });
    }
    router.emit('local::init routerInit', router);
  }
  destroy() {
    let router = this;

    router.emit('local::destroy routerDestroy', router);

    // Delete props & methods
    Object.keys(router).forEach((routerProp) => {
      router[routerProp] = null;
      delete router[routerProp];
    });

    router = null;
  }
}

var Router$1 = {
  name: 'router',
  static: {
    Router,
  },
  instance: {
    cache: {
      xhr: [],
      templates: [],
      components: [],
    },
  },
  create() {
    const instance = this;
    if (instance.app) {
      // View Router
      if (instance.params.router) {
        instance.router = new Router(instance.app, instance);
      }
    } else {
      // App Router
      instance.router = new Router(instance);
    }
  },
};

class View extends Framework7Class {
  constructor(appInstance, el, viewParams = {}) {
    super(viewParams, [appInstance]);

    const app = appInstance;
    const $el = $(el);
    const view = this;

    const defaults = {
      routes: [],
      routesAdd: [],
    };

    // Default View params
    view.params = Utils.extend(defaults, app.params.view, viewParams);

    // Routes
    if (view.params.routes.length > 0) {
      view.routes = view.params.routes;
    } else {
      view.routes = [].concat(app.routes, view.params.routesAdd);
    }

    // Selector
    let selector;
    if (typeof el === 'string') selector = el;
    else {
      // Supposed to be HTMLElement or Dom7
      selector = ($el.attr('id') ? `#${$el.attr('id')}` : '') + ($el.attr('class') ? `.${$el.attr('class').replace(/ /g, '.').replace('.active', '')}` : '');
    }

    // DynamicNavbar
    let $navbarEl;
    if (app.theme === 'ios' && view.params.iosDynamicNavbar && view.params.iosSeparateDynamicNavbar) {
      $navbarEl = $el.children('.navbar').eq(0);
      if ($navbarEl.length === 0) {
        $navbarEl = $('<div class="navbar"></div>');
      }
    }

    // View Props
    Utils.extend(false, view, {
      app,
      $el,
      el: $el[0],
      name: view.params.name,
      main: view.params.main || $el.hasClass('view-main'),
      $navbarEl,
      navbarEl: $navbarEl ? $navbarEl[0] : undefined,
      selector,
      history: [],
      scrollHistory: {},
    });

    // Save in DOM
    $el[0].f7View = view;

    // Install Modules
    view.useModules();

    // Add to app
    app.views.push(view);
    if (view.main) {
      app.views.main = view;
    }
    if (view.name) {
      app.views[view.name] = view;
    }

    // Index
    view.index = app.views.indexOf(view);

    // View ID
    let viewId;
    if (view.name) {
      viewId = `view_${view.name}`;
    } else if (view.main) {
      viewId = 'view_main';
    } else {
      viewId = `view_${view.index}`;
    }
    view.id = viewId;

    // Init View
    if (app.initialized) {
      view.init();
    } else {
      app.on('init', () => {
        view.init();
      });
    }

    return view;
  }
  destroy() {
    let view = this;
    const app = view.app;

    view.$el.trigger('view:beforedestroy', view);
    view.emit('local::beforeDestroy viewBeforeDestroy', view);

    if (view.main) {
      app.views.main = null;
      delete app.views.main;
    } else if (view.name) {
      app.views[view.name] = null;
      delete app.views[view.name];
    }
    view.$el[0].f7View = null;
    delete view.$el[0].f7View;

    app.views.splice(app.views.indexOf(view), 1);

    // Destroy Router
    if (view.params.router && view.router) {
      view.router.destroy();
    }

    view.emit('local::destroy viewDestroy', view);

    // Delete props & methods
    Object.keys(view).forEach((viewProp) => {
      view[viewProp] = null;
      delete view[viewProp];
    });

    view = null;
  }
  init() {
    const view = this;
    if (view.params.router) {
      view.router.init();
    }
  }
}

// Use Router
View.use(Router$1);

function initClicks(app) {
  function handleClicks(e) {
    const clicked = $(e.target);
    const clickedLink = clicked.closest('a');
    const isLink = clickedLink.length > 0;
    const url = isLink && clickedLink.attr('href');
    const isTabLink = isLink && clickedLink.hasClass('tab-link') && (clickedLink.attr('data-tab') || (url && url.indexOf('#') === 0));

    // Check if link is external
    if (isLink) {
      // eslint-disable-next-line
      if (clickedLink.is(app.params.clicks.externalLinks) || (url && url.indexOf('javascript:') >= 0)) {
        const target = clickedLink.attr('target');
        if (url && (target === '_system' || target === '_blank' || target === '_browser')) {
          e.preventDefault();
          if (target !== '_browser' && window$1.cordova && window$1.cordova.InAppBrowser) {
            window$1.cordova.InAppBrowser.open(url, target);
          } else {
            window$1.open(url, target);
          }
        }
        return;
      }
    }

    // Modules Clicks
    Object.keys(app.modules).forEach((moduleName) => {
      const moduleClicks = app.modules[moduleName].clicks;
      if (!moduleClicks) return;
      Object.keys(moduleClicks).forEach((clickSelector) => {
        const matchingClickedElement = clicked.closest(clickSelector).eq(0);
        if (matchingClickedElement.length > 0) {
          moduleClicks[clickSelector].call(app, matchingClickedElement, matchingClickedElement.dataset());
        }
      });
    });

    // Load Page
    let clickedLinkData = {};
    if (isLink) {
      e.preventDefault();
      clickedLinkData = clickedLink.dataset();
    }
    const validUrl = url && url.length > 0 && url !== '#' && !isTabLink;
    const template = clickedLinkData.template;
    if (validUrl || clickedLink.hasClass('back') || template) {
      let view;
      if (clickedLinkData.view) {
        view = $(clickedLinkData.view)[0].f7View;
      } else {
        view = clicked.parents('.view')[0] && clicked.parents('.view')[0].f7View;
        if (!clickedLink.hasClass('back') && view && view.params.linksView) {
          if (typeof view.params.linksView === 'string') view = $(view.params.linksView)[0].f7View;
          else if (view.params.linksView instanceof View) view = view.params.linksView;
        }
      }
      if (!view) {
        if (app.views.main) view = app.views.main;
      }
      if (!view || !view.router) return;
      if (clickedLinkData.context && typeof clickedLinkData.context === 'string') {
        try {
          clickedLinkData.context = JSON.parse(clickedLinkData.context);
        } catch (err) {
          // something wrong there
        }
      }
      if (clickedLink.hasClass('back')) view.router.back(url, clickedLinkData);
      else view.router.navigate(url, clickedLinkData);
    }
  }

  app.on('click', handleClicks);

  // Prevent scrolling on overlays
  function preventScrolling(e) {
    e.preventDefault();
  }
  if (Support.touch && !Device.android) {
    const activeListener = Support.passiveListener ? { passive: false, capture: false } : false;
    $(document).on((app.params.touch.fastClicks ? 'touchstart' : 'touchmove'), '.panel-backdrop, .dialog-backdrop, .preloader-backdrop, .popup-backdrop, .searchbar-backdrop', preventScrolling, activeListener);
  }
}
var ClicksModule = {
  name: 'clicks',
  params: {
    clicks: {
      // External Links
      externalLinks: '.external',
    },
  },
  on: {
    init() {
      const app = this;
      initClicks(app);
    },
  },
};

var HistoryModule = {
  name: 'history',
  static: {
    history: History,
  },
  on: {
    init() {
      History.init(this);
    },
  },
};

const keyPrefix = 'f7storage-';
const Storage = {
  get(key) {
    return Utils.promise((resolve, reject) => {
      try {
        const value = JSON.parse(window$1.localStorage.getItem(`${keyPrefix}${key}`));
        resolve(value);
      } catch (e) {
        reject(e);
      }
    });
  },
  set(key, value) {
    return Utils.promise((resolve, reject) => {
      try {
        window$1.localStorage.setItem(`${keyPrefix}${key}`, JSON.stringify(value));
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
  remove(key) {
    return Utils.promise((resolve, reject) => {
      try {
        window$1.localStorage.removeItem(`${keyPrefix}${key}`);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
  clear() {

  },
  length() {

  },
  keys() {
    return Utils.promise((resolve, reject) => {
      try {
        const keys = Object.keys(window$1.localStorage)
          .filter(keyName => keyName.indexOf(keyPrefix) === 0)
          .map(keyName => keyName.replace(keyPrefix, ''));
        resolve(keys);
      } catch (e) {
        reject(e);
      }
    });
  },
  forEach(callback) {
    return Utils.promise((resolve, reject) => {
      try {
        Object.keys(window$1.localStorage)
          .filter(keyName => keyName.indexOf(keyPrefix) === 0)
          .forEach((keyName, index) => {
            const key = keyName.replace(keyPrefix, '');
            Storage.get(key).then((value) => {
              callback(key, value, index);
            });
          });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },
};

var StorageModule = {
  name: 'storage',
  static: {
    Storage,
    storage: Storage,
  },
};

const Statusbar = {
  hide() {
    $('html').removeClass('with-statusbar');
    if (Device.cordova && window$1.StatusBar) {
      window$1.StatusBar.hide();
    }
  },
  show() {
    if (Device.cordova && window$1.StatusBar) {
      window$1.StatusBar.show();
      Utils.nextTick(() => {
        if (Device.needsStatusbarOverlay()) {
          $('html').addClass('with-statusbar');
        }
      });
      return;
    }
    $('html').addClass('with-statusbar');
  },
  onClick() {
    const app = this;
    let pageContent;
    if ($('.popup.modal-in').length > 0) {
      // Check for opened popup
      pageContent = $('.popup.modal-in').find('.page:not(.page-previous):not(.page-next):not(.cached)').find('.page-content');
    } else if ($('.panel.panel-active').length > 0) {
      // Check for opened panel
      pageContent = $('.panel.panel-active').find('.page:not(.page-previous):not(.page-next):not(.cached)').find('.page-content');
    } else if ($('.views > .view.tab-active').length > 0) {
      // View in tab bar app layout
      pageContent = $('.views > .view.tab-active').find('.page:not(.page-previous):not(.page-next):not(.cached)').find('.page-content');
    } else if ($('.views').length > 0) {
      pageContent = $('.views').find('.page:not(.page-previous):not(.page-next):not(.cached)').find('.page-content');
    } else {
      pageContent = app.root.children('.view').find('.page:not(.page-previous):not(.page-next):not(.cached)').find('.page-content');
    }

    if (pageContent && pageContent.length > 0) {
      // Check for tab
      if (pageContent.hasClass('tab')) {
        pageContent = pageContent.parent('.tabs').children('.page-content.tab-active');
      }
      if (pageContent.length > 0) pageContent.scrollTop(0, 300);
    }
  },
  setIosTextColor(color) {
    if (Device.cordova && window$1.StatusBar) {
      if (color === 'white') {
        window$1.StatusBar.styleLightContent();
      } else {
        window$1.StatusBar.styleDefault();
      }
    }
  },
  setBackgroundColor(color) {
    $('.statusbar').css('background-color', color);
    if (Device.cordova && window$1.StatusBar) {
      window$1.StatusBar.backgroundColorByHexString(color);
    }
  },
  isVisible() {
    if (Device.cordova && window$1.StatusBar) {
      return window$1.StatusBar.isVisible;
    }
    return false;
  },
  iosOverlaysWebView(overlays = true) {
    if (!Device.ios) return;
    if (Device.cordova && window$1.StatusBar) {
      window$1.StatusBar.overlaysWebView(overlays);
      if (overlays) {
        $('html').addClass('with-statusbar');
      } else {
        $('html').removeClass('with-statusbar');
      }
    }
  },
  checkOverlay() {
    if (Device.needsStatusbarOverlay()) {
      $('html').addClass('with-statusbar');
    } else {
      $('html').removeClass('with-statusbar');
    }
  },
  init() {
    const app = this;
    const params = app.params.statusbar;
    if (!params.enabled) return;

    if (params.overlay === 'auto') {
      if (Device.needsStatusbarOverlay()) {
        $('html').addClass('with-statusbar');
      } else {
        $('html').removeClass('with-statusbar');
      }

      if (Device.ios && (Device.cordova || Device.webView)) {
        if (window$1.orientation === 0) {
          app.once('resize', () => {
            Statusbar.checkOverlay();
          });
        }

        $(document).on('resume', () => {
          Statusbar.checkOverlay();
        }, false);

        app.on(Device.ios ? 'orientationchange' : 'orientationchange resize', () => {
          Statusbar.checkOverlay();
        });
      }
    } else if (params.overlay === true) {
      $('html').addClass('with-statusbar');
    } else if (params.overlay === false) {
      $('html').removeClass('with-statusbar');
    }

    if (Device.cordova && window$1.StatusBar) {
      if (params.scrollTopOnClick) {
        $(window$1).on('statusTap', Statusbar.onClick.bind(app));
      }
      if (params.iosOverlaysWebView) {
        window$1.StatusBar.overlaysWebView(true);
      } else {
        window$1.StatusBar.overlaysWebView(false);
      }

      if (params.iosTextColor === 'white') {
        window$1.StatusBar.styleLightContent();
      } else {
        window$1.StatusBar.styleDefault();
      }
    }
    if (params.iosBackgroundColor && app.theme === 'ios') {
      Statusbar.setBackgroundColor(params.iosBackgroundColor);
    }
    if (params.materialBackgroundColor && app.theme === 'md') {
      Statusbar.setBackgroundColor(params.materialBackgroundColor);
    }
  },
};

var Statusbar$1 = {
  name: 'statusbar',
  params: {
    statusbar: {
      enabled: true,
      overlay: 'auto',
      scrollTopOnClick: true,
      iosOverlaysWebView: true,
      iosTextColor: 'black',
      iosBackgroundColor: null,
      materialBackgroundColor: null,
    },
  },
  create() {
    const app = this;
    Utils.extend(app, {
      statusbar: {
        checkOverlay: Statusbar.checkOverlay,
        hide: Statusbar.hide,
        show: Statusbar.show,
        iosOverlaysWebView: Statusbar.iosOverlaysWebView,
        setIosTextColor: Statusbar.setIosTextColor,
        setBackgroundColor: Statusbar.setBackgroundColor,
        isVisible: Statusbar.isVisible,
        init: Statusbar.init.bind(app),
      },
    });
  },
  on: {
    init() {
      const app = this;
      Statusbar.init.call(app);
    },
  },
  clicks: {
    '.statusbar': function onStatusbarClick() {
      const app = this;
      if (!app.params.statusbar.enabled) return;
      if (!app.params.statusbar.scrollTopOnClick) return;
      Statusbar.onClick.call(app);
    },
  },
};

function getCurrentView(app) {
  const popoverView = $('.popover.modal-in .view');
  const popupView = $('.popup.modal-in .view');
  const panelView = $('.panel.panel-active .view');
  let appViews = $('.views');
  if (appViews.length === 0) appViews = app.root;
  // Find active view as tab
  let appView = appViews.children('.view');
  // Propably in tabs or split view
  if (appView.length > 1) {
    if (appView.hasClass('tab')) {
      // Tabs
      appView = appViews.children('.view.tab-active');
    }
  }
  if (popoverView.length > 0 && popoverView[0].f7View) return popoverView[0].f7View;
  if (popupView.length > 0 && popupView[0].f7View) return popupView[0].f7View;
  if (panelView.length > 0 && panelView[0].f7View) return panelView[0].f7View;
  if (appView.length > 0) {
    if (appView.length === 1 && appView[0].f7View) return appView[0].f7View;
    if (appView.length > 1) {
      return app.views.main;
    }
  }
  return undefined;
}

var View$1 = {
  name: 'view',
  params: {
    view: {
      name: undefined,
      main: false,
      router: true,
      linksView: null,
      stackPages: false,
      xhrCache: true,
      xhrCacheIgnore: [],
      xhrCacheIgnoreGetParameters: false,
      xhrCacheDuration: 1000 * 60 * 10, // Ten minutes
      preloadPreviousPage: true,
      uniqueHistory: false,
      uniqueHistoryIgnoreGetParameters: false,
      allowDuplicateUrls: false,
      reloadPages: false,
      removeElements: true,
      removeElementsWithTimeout: false,
      removeElementsTimeout: 0,
      restoreScrollTopOnBack: true,
      unloadTabContent: true,
      passRouteQueryToRequest: true,
      passRouteParamsToRequest: false,
      // Swipe Back
      iosSwipeBack: true,
      iosSwipeBackAnimateShadow: true,
      iosSwipeBackAnimateOpacity: true,
      iosSwipeBackActiveArea: 30,
      iosSwipeBackThreshold: 0,
      mdSwipeBack: false,
      mdSwipeBackAnimateShadow: true,
      mdSwipeBackAnimateOpacity: false,
      mdSwipeBackActiveArea: 30,
      mdSwipeBackThreshold: 0,
      // Push State
      pushState: false,
      pushStateRoot: undefined,
      pushStateAnimate: true,
      pushStateAnimateOnLoad: false,
      pushStateSeparator: '#!',
      pushStateOnLoad: true,
      // Animate Pages
      animate: true,
      animateWithJS: false,
      // iOS Dynamic Navbar
      iosDynamicNavbar: true,
      iosSeparateDynamicNavbar: true,
      // Animate iOS Navbar Back Icon
      iosAnimateNavbarBackIcon: true,
      // Delays
      iosPageLoadDelay: 0,
      materialPageLoadDelay: 0,
    },
  },
  static: {
    View,
  },
  create() {
    const app = this;
    Utils.extend(app, {
      views: Utils.extend([], {
        create(el, params) {
          return new View(app, el, params);
        },
        get(viewEl) {
          const $viewEl = $(viewEl);
          if ($viewEl.length && $viewEl[0].f7View) return $viewEl[0].f7View;
          return undefined;
        },
      }),
    });
    Object.defineProperty(app.views, 'current', {
      enumerable: true,
      configurable: true,
      get() {
        return getCurrentView(app);
      },
    });
    // Alias
    app.view = app.views;
  },
  on: {
    init() {
      const app = this;
      $('.view-init').each((index, viewEl) => {
        if (viewEl.f7View) return;
        const viewParams = $(viewEl).dataset();
        app.views.create(viewEl, viewParams);
      });
    },
    modalOpen(modal) {
      const app = this;
      modal.$el.find('.view-init').each((index, viewEl) => {
        if (viewEl.f7View) return;
        const viewParams = $(viewEl).dataset();
        app.views.create(viewEl, viewParams);
      });
    },
    modalBeforeDestroy(modal) {
      if (!modal || !modal.$el) return;
      modal.$el.find('.view-init').each((index, viewEl) => {
        const view = viewEl.f7View;
        if (!view) return;
        view.destroy();
      });
    },
  },
};

const Navbar = {
  size(el) {
    const app = this;
    if (app.theme !== 'ios') return;
    let $el = $(el);
    if ($el.hasClass('navbar')) {
      $el = $el.children('.navbar-inner').each((index, navbarEl) => {
        app.navbar.size(navbarEl);
      });
      return;
    }
    if (
      $el.hasClass('stacked') ||
      $el.parents('.stacked').length > 0 ||
      $el.parents('.tab:not(.tab-active)').length > 0 ||
      $el.parents('.popup:not(.modal-in)').length > 0
    ) {
      return;
    }
    const $viewEl = $el.parents('.view').eq(0);
    const left = app.rtl ? $el.children('.right') : $el.children('.left');
    const right = app.rtl ? $el.children('.left') : $el.children('.right');
    const title = $el.children('.title');
    const subnavbar = $el.children('.subnavbar');
    const noLeft = left.length === 0;
    const noRight = right.length === 0;
    const leftWidth = noLeft ? 0 : left.outerWidth(true);
    const rightWidth = noRight ? 0 : right.outerWidth(true);
    const titleWidth = title.outerWidth(true);
    const navbarStyles = $el.styles();
    const navbarWidth = $el[0].offsetWidth;
    const navbarInnerWidth = navbarWidth - parseInt(navbarStyles.paddingLeft, 10) - parseInt(navbarStyles.paddingRight, 10);
    const isPrevious = $el.hasClass('navbar-previous');
    const sliding = $el.hasClass('sliding');

    let router;
    let dynamicNavbar;
    let separateNavbar;
    let separateNavbarRightOffset = 0;
    let separateNavbarLeftOffset = 0;

    if ($viewEl.length > 0 && $viewEl[0].f7View) {
      router = $viewEl[0].f7View.router;
      dynamicNavbar = router && router.dynamicNavbar;
      separateNavbar = router && router.separateNavbar;
      if (!separateNavbar) {
        separateNavbarRightOffset = navbarWidth;
        separateNavbarLeftOffset = navbarWidth / 5;
      }
    }

    let currLeft;
    let diff;
    if (noRight) {
      currLeft = navbarInnerWidth - titleWidth;
    }
    if (noLeft) {
      currLeft = 0;
    }
    if (!noLeft && !noRight) {
      currLeft = ((navbarInnerWidth - rightWidth - titleWidth) + leftWidth) / 2;
    }
    let requiredLeft = (navbarInnerWidth - titleWidth) / 2;
    if (navbarInnerWidth - leftWidth - rightWidth > titleWidth) {
      if (requiredLeft < leftWidth) {
        requiredLeft = leftWidth;
      }
      if (requiredLeft + titleWidth > navbarInnerWidth - rightWidth) {
        requiredLeft = navbarInnerWidth - rightWidth - titleWidth;
      }
      diff = requiredLeft - currLeft;
    } else {
      diff = 0;
    }

    // RTL inverter
    const inverter = app.rtl ? -1 : 1;

    if (dynamicNavbar) {
      if (title.hasClass('sliding') || (title.length > 0 && sliding)) {
        let titleLeftOffset = (-(currLeft + diff) * inverter) + separateNavbarLeftOffset;
        const titleRightOffset = ((navbarInnerWidth - currLeft - diff - titleWidth) * inverter) - separateNavbarRightOffset;

        if (isPrevious) {
          if (router && router.params.iosAnimateNavbarBackIcon) {
            const activeNavbarBackLink = $el.parent().find('.navbar-current').children('.left.sliding').find('.back .icon ~ span');
            if (activeNavbarBackLink.length > 0) {
              titleLeftOffset += activeNavbarBackLink[0].offsetLeft;
            }
          }
        }
        title[0].f7NavbarLeftOffset = titleLeftOffset;
        title[0].f7NavbarRightOffset = titleRightOffset;
      }
      if (!noLeft && (left.hasClass('sliding') || sliding)) {
        if (app.rtl) {
          left[0].f7NavbarLeftOffset = (-(navbarInnerWidth - left[0].offsetWidth) / 2) * inverter;
          left[0].f7NavbarRightOffset = leftWidth * inverter;
        } else {
          left[0].f7NavbarLeftOffset = -leftWidth + separateNavbarLeftOffset;
          left[0].f7NavbarRightOffset = ((navbarInnerWidth - left[0].offsetWidth) / 2) - separateNavbarRightOffset;
          if (router && router.params.iosAnimateNavbarBackIcon && left.find('.back .icon').length > 0) {
            left[0].f7NavbarRightOffset -= left.find('.back .icon')[0].offsetWidth;
          }
        }
      }
      if (!noRight && (right.hasClass('sliding') || sliding)) {
        if (app.rtl) {
          right[0].f7NavbarLeftOffset = -rightWidth * inverter;
          right[0].f7NavbarRightOffset = ((navbarInnerWidth - right[0].offsetWidth) / 2) * inverter;
        } else {
          right[0].f7NavbarLeftOffset = (-(navbarInnerWidth - right[0].offsetWidth) / 2) + separateNavbarLeftOffset;
          right[0].f7NavbarRightOffset = rightWidth - separateNavbarRightOffset;
        }
      }
      if (subnavbar.length && (subnavbar.hasClass('sliding') || sliding)) {
        subnavbar[0].f7NavbarLeftOffset = app.rtl ? subnavbar[0].offsetWidth : (-subnavbar[0].offsetWidth + separateNavbarLeftOffset);
        subnavbar[0].f7NavbarRightOffset = (-subnavbar[0].f7NavbarLeftOffset - separateNavbarRightOffset) + separateNavbarLeftOffset;
      }
    }

    // Title left
    if (app.params.navbar.iosCenterTitle) {
      let titleLeft = diff;
      if (app.rtl && noLeft && noRight && title.length > 0) titleLeft = -titleLeft;
      title.css({ left: `${titleLeft}px` });
    }
  },
  hide(el, animate = true) {
    let $el = $(el);
    if ($el.hasClass('navbar-inner')) $el = $el.parents('.navbar');
    if (!$el.length) return;
    if ($el.hasClass('navbar-hidden')) return;
    const className = `navbar-hidden${animate ? ' navbar-transitioning' : ''}`;
    $el.transitionEnd(() => {
      $el.removeClass('navbar-transitioning');
    });
    $el.addClass(className);
  },
  show(el = '.navbar-hidden', animate = true) {
    let $el = $(el);
    if ($el.hasClass('navbar-inner')) $el = $el.parents('.navbar');
    if (!$el.length) return;
    if (!$el.hasClass('navbar-hidden')) return;
    if (animate) {
      $el.addClass('navbar-transitioning');
      $el.transitionEnd(() => {
        $el.removeClass('navbar-transitioning');
      });
    }
    $el.removeClass('navbar-hidden');
  },
  getElByPage(page) {
    let $pageEl;
    let $navbarEl;
    let pageData;
    if (page.$navbarEl || page.$el) {
      pageData = page;
      $pageEl = page.$el;
    } else {
      $pageEl = $(page);
      if ($pageEl.length > 0) pageData = $pageEl[0].f7Page;
    }
    if (pageData && pageData.$navbarEl && pageData.$navbarEl.length > 0) {
      $navbarEl = pageData.$navbarEl;
    } else if ($pageEl) {
      $navbarEl = $pageEl.children('.navbar').children('.navbar-inner');
    }
    if (!$navbarEl || ($navbarEl && $navbarEl.length === 0)) return undefined;
    return $navbarEl[0];
  },
  getPageByEl(navbarInnerEl) {
    let $navbarInnerEl = $(navbarInnerEl);
    if ($navbarInnerEl.hasClass('navbar')) {
      $navbarInnerEl = $navbarInnerEl.find('.navbar-inner');
      if ($navbarInnerEl.length > 1) return undefined;
    }
    return $navbarInnerEl[0].f7Page;
  },
  initHideNavbarOnScroll(pageEl, navbarInnerEl) {
    const app = this;
    const $pageEl = $(pageEl);
    const $navbarEl = $(navbarInnerEl || app.navbar.getElByPage(pageEl)).closest('.navbar');

    let previousScrollTop;
    let currentScrollTop;

    let scrollHeight;
    let offsetHeight;
    let reachEnd;
    let action;
    let navbarHidden;
    function handleScroll() {
      const scrollContent = this;
      if ($pageEl.hasClass('page-previous')) return;
      currentScrollTop = scrollContent.scrollTop;
      scrollHeight = scrollContent.scrollHeight;
      offsetHeight = scrollContent.offsetHeight;
      reachEnd = currentScrollTop + offsetHeight >= scrollHeight;
      navbarHidden = $navbarEl.hasClass('navbar-hidden');

      if (reachEnd) {
        if (app.params.navbar.showOnPageScrollEnd) {
          action = 'show';
        }
      } else if (previousScrollTop > currentScrollTop) {
        if (app.params.navbar.showOnPageScrollTop || currentScrollTop <= 44) {
          action = 'show';
        } else {
          action = 'hide';
        }
      } else if (currentScrollTop > 44) {
        action = 'hide';
      } else {
        action = 'show';
      }

      if (action === 'show' && navbarHidden) {
        app.navbar.show($navbarEl);
        navbarHidden = false;
      } else if (action === 'hide' && !navbarHidden) {
        app.navbar.hide($navbarEl);
        navbarHidden = true;
      }

      previousScrollTop = currentScrollTop;
    }
    $pageEl.on('scroll', '.page-content', handleScroll, true);
    $pageEl[0].f7ScrollNavbarHandler = handleScroll;
  },
};
var Navbar$1 = {
  name: 'navbar',
  create() {
    const app = this;
    Utils.extend(app, {
      navbar: {
        size: Navbar.size.bind(app),
        hide: Navbar.hide.bind(app),
        show: Navbar.show.bind(app),
        getElByPage: Navbar.getElByPage.bind(app),
        initHideNavbarOnScroll: Navbar.initHideNavbarOnScroll.bind(app),
      },
    });
  },
  params: {
    navbar: {
      scrollTopOnTitleClick: true,
      iosCenterTitle: true,
      hideOnPageScroll: false,
      showOnPageScrollEnd: true,
      showOnPageScrollTop: true,
    },
  },
  on: {
    'panelBreakpoint resize': function onResize() {
      const app = this;
      if (app.theme !== 'ios') return;
      $('.navbar').each((index, navbarEl) => {
        app.navbar.size(navbarEl);
      });
    },
    pageBeforeRemove(page) {
      if (page.$el[0].f7ScrollNavbarHandler) {
        page.$el.off('scroll', '.page-content', page.$el[0].f7ScrollNavbarHandler, true);
      }
    },
    pageBeforeIn(page) {
      const app = this;
      if (app.theme !== 'ios') return;
      let $navbarEl;
      const view = page.$el.parents('.view')[0].f7View;
      const navbarInnerEl = app.navbar.getElByPage(page);
      if (!navbarInnerEl) {
        $navbarEl = page.$el.parents('.view').children('.navbar');
      } else {
        $navbarEl = $(navbarInnerEl).parents('.navbar');
      }
      if (page.$el.hasClass('no-navbar') || (view.router.dynamicNavbar && !navbarInnerEl)) {
        const animate = !!(page.pageFrom && page.router.history.length > 0);
        app.navbar.hide($navbarEl, animate);
      } else {
        app.navbar.show($navbarEl);
      }
    },
    pageReinit(page) {
      const app = this;
      if (app.theme !== 'ios') return;
      const $navbarEl = $(app.navbar.getElByPage(page));
      if (!$navbarEl || $navbarEl.length === 0) return;
      app.navbar.size($navbarEl);
    },
    pageInit(page) {
      const app = this;
      const $navbarEl = $(app.navbar.getElByPage(page));
      if (!$navbarEl || $navbarEl.length === 0) return;
      if (app.theme === 'ios') {
        app.navbar.size($navbarEl);
      }
      if (
        app.params.navbar.hideOnPageScroll ||
        page.$el.find('.hide-navbar-on-scroll').length ||
        page.$el.hasClass('hide-navbar-on-scroll') ||
        page.$el.find('.hide-bars-on-scroll').length ||
        page.$el.hasClass('hide-bars-on-scroll')
      ) {
        if (
          page.$el.find('.keep-navbar-on-scroll').length ||
          page.$el.hasClass('keep-navbar-on-scroll') ||
          page.$el.find('.keep-bars-on-scroll').length ||
          page.$el.hasClass('keep-bars-on-scroll')
        ) {
          return;
        }
        app.navbar.initHideNavbarOnScroll(page.el, $navbarEl[0]);
      }
    },
    modalOpen(modal) {
      const app = this;
      if (app.theme !== 'ios') return;
      modal.$el.find('.navbar:not(.navbar-previous):not(.stacked)').each((index, navbarEl) => {
        app.navbar.size(navbarEl);
      });
    },
    panelOpen(panel) {
      const app = this;
      if (app.theme !== 'ios') return;
      panel.$el.find('.navbar:not(.navbar-previous):not(.stacked)').each((index, navbarEl) => {
        app.navbar.size(navbarEl);
      });
    },
    panelSwipeOpen(panel) {
      const app = this;
      if (app.theme !== 'ios') return;
      panel.$el.find('.navbar:not(.navbar-previous):not(.stacked)').each((index, navbarEl) => {
        app.navbar.size(navbarEl);
      });
    },
    tabShow(tabEl) {
      const app = this;
      $(tabEl).find('.navbar:not(.navbar-previous):not(.stacked)').each((index, navbarEl) => {
        app.navbar.size(navbarEl);
      });
    },
  },
  clicks: {
    '.navbar .title': function onTitleClick($clickedEl) {
      const app = this;
      if (!app.params.navbar.scrollTopOnTitleClick) return;
      if ($clickedEl.closest('a').length > 0) {
        return;
      }
      let pageContent;
      // Find active page
      const navbar = $clickedEl.parents('.navbar');

      // Static Layout
      pageContent = navbar.parents('.page-content');

      if (pageContent.length === 0) {
        // Fixed Layout
        if (navbar.parents('.page').length > 0) {
          pageContent = navbar.parents('.page').find('.page-content');
        }
        // Through Layout
        if (pageContent.length === 0) {
          if (navbar.nextAll('.page-current:not(.stacked)').length > 0) {
            pageContent = navbar.nextAll('.page-current:not(.stacked)').find('.page-content');
          }
        }
      }
      if (pageContent && pageContent.length > 0) {
        // Check for tab
        if (pageContent.hasClass('tab')) {
          pageContent = pageContent.parent('.tabs').children('.page-content.tab-active');
        }
        if (pageContent.length > 0) pageContent.scrollTop(0, 300);
      }
    },
  },
};

const Toolbar = {
  setHighlight(tabbarEl) {
    const app = this;
    if (app.theme !== 'md') return;

    const $tabbarEl = $(tabbarEl);

    if ($tabbarEl.length === 0 || !($tabbarEl.hasClass('tabbar') || $tabbarEl.hasClass('tabbar-labels'))) return;

    if ($tabbarEl.find('.tab-link-highlight').length === 0) {
      $tabbarEl.children('.toolbar-inner').append('<span class="tab-link-highlight"></span>');
    }

    const $highlightEl = $tabbarEl.find('.tab-link-highlight');
    const $activeLink = $tabbarEl.find('.tab-link-active');
    let highlightWidth;
    let highlightTranslate;

    if ($tabbarEl.hasClass('tabbar-scrollable') && $activeLink && $activeLink[0]) {
      highlightWidth = `${$activeLink[0].offsetWidth}px`;
      highlightTranslate = `${$activeLink[0].offsetLeft}px`;
    } else {
      const activeIndex = $activeLink.index();
      const tabLinksCount = $tabbarEl.find('.tab-link').length;
      highlightWidth = `${100 / tabLinksCount}%`;
      highlightTranslate = `${(app.rtl ? -activeIndex : activeIndex) * 100}%`;
    }

    $highlightEl
      .css('width', highlightWidth)
      .transform(`translate3d(${highlightTranslate},0,0)`);
  },
  init(tabbarEl) {
    const app = this;
    app.toolbar.setHighlight(tabbarEl);
  },
  hide(el, animate = true) {
    const $el = $(el);
    if ($el.hasClass('toolbar-hidden')) return;
    const className = `toolbar-hidden${animate ? ' toolbar-transitioning' : ''}`;
    $el.transitionEnd(() => {
      $el.removeClass('toolbar-transitioning');
    });
    $el.addClass(className);
  },
  show(el, animate = true) {
    const $el = $(el);
    if (!$el.hasClass('toolbar-hidden')) return;
    if (animate) {
      $el.addClass('toolbar-transitioning');
      $el.transitionEnd(() => {
        $el.removeClass('toolbar-transitioning');
      });
    }
    $el.removeClass('toolbar-hidden');
  },
  initHideToolbarOnScroll(pageEl) {
    const app = this;
    const $pageEl = $(pageEl);
    let $toolbarEl = $pageEl.parents('.view').children('.toolbar');
    if ($toolbarEl.length === 0) {
      $toolbarEl = $pageEl.find('.toolbar');
    }
    if ($toolbarEl.length === 0) {
      $toolbarEl = $pageEl.parents('.views').children('.tabbar, .tabbar-labels');
    }
    if ($toolbarEl.length === 0) {
      return;
    }

    let previousScrollTop;
    let currentScrollTop;

    let scrollHeight;
    let offsetHeight;
    let reachEnd;
    let action;
    let toolbarHidden;
    function handleScroll() {
      const scrollContent = this;
      if ($pageEl.hasClass('page-previous')) return;
      currentScrollTop = scrollContent.scrollTop;
      scrollHeight = scrollContent.scrollHeight;
      offsetHeight = scrollContent.offsetHeight;
      reachEnd = currentScrollTop + offsetHeight >= scrollHeight;
      toolbarHidden = $toolbarEl.hasClass('toolbar-hidden');

      if (reachEnd) {
        if (app.params.toolbar.showOnPageScrollEnd) {
          action = 'show';
        }
      } else if (previousScrollTop > currentScrollTop) {
        if (app.params.toolbar.showOnPageScrollTop || currentScrollTop <= 44) {
          action = 'show';
        } else {
          action = 'hide';
        }
      } else if (currentScrollTop > 44) {
        action = 'hide';
      } else {
        action = 'show';
      }

      if (action === 'show' && toolbarHidden) {
        app.toolbar.show($toolbarEl);
        toolbarHidden = false;
      } else if (action === 'hide' && !toolbarHidden) {
        app.toolbar.hide($toolbarEl);
        toolbarHidden = true;
      }

      previousScrollTop = currentScrollTop;
    }
    $pageEl.on('scroll', '.page-content', handleScroll, true);
    $pageEl[0].f7ScrollToolbarHandler = handleScroll;
  },
};
var Toolbar$1 = {
  name: 'toolbar',
  create() {
    const app = this;
    Utils.extend(app, {
      toolbar: {
        hide: Toolbar.hide.bind(app),
        show: Toolbar.show.bind(app),
        setHighlight: Toolbar.setHighlight.bind(app),
        initHideToolbarOnScroll: Toolbar.initHideToolbarOnScroll.bind(app),
        init: Toolbar.init.bind(app),
      },
    });
  },
  params: {
    toolbar: {
      hideOnPageScroll: false,
      showOnPageScrollEnd: true,
      showOnPageScrollTop: true,
    },
  },
  on: {
    pageBeforeRemove(page) {
      if (page.$el[0].f7ScrollToolbarHandler) {
        page.$el.off('scroll', '.page-content', page.$el[0].f7ScrollToolbarHandler, true);
      }
    },
    pageBeforeIn(page) {
      const app = this;
      let $toolbarEl = page.$el.parents('.view').children('.toolbar');
      if ($toolbarEl.length === 0) {
        $toolbarEl = page.$el.find('.toolbar');
      }
      if ($toolbarEl.length === 0) {
        $toolbarEl = page.$el.parents('.views').children('.tabbar, .tabbar-labels');
      }
      if ($toolbarEl.length === 0) {
        return;
      }
      if (page.$el.hasClass('no-toolbar')) {
        app.toolbar.hide($toolbarEl);
      } else {
        app.toolbar.show($toolbarEl);
      }
    },
    pageInit(page) {
      const app = this;
      page.$el.find('.tabbar, .tabbar-labels').each((index, tabbarEl) => {
        app.toolbar.init(tabbarEl);
      });
      if (
        app.params.toolbar.hideOnPageScroll ||
        page.$el.find('.hide-toolbar-on-scroll').length ||
        page.$el.hasClass('hide-toolbar-on-scroll') ||
        page.$el.find('.hide-bars-on-scroll').length ||
        page.$el.hasClass('hide-bars-on-scroll')
      ) {
        if (
          page.$el.find('.keep-toolbar-on-scroll').length ||
          page.$el.hasClass('keep-toolbar-on-scroll') ||
          page.$el.find('.keep-bars-on-scroll').length ||
          page.$el.hasClass('keep-bars-on-scroll')
        ) {
          return;
        }
        app.toolbar.initHideToolbarOnScroll(page.el);
      }
    },
    init() {
      const app = this;
      app.root.find('.tabbar, .tabbar-labels').each((index, tabbarEl) => {
        app.toolbar.init(tabbarEl);
      });
    },
  },
};

var Subnavbar = {
  name: 'subnavbar',
  on: {
    pageInit(page) {
      if (page.$navbarEl && page.$navbarEl.length && page.$navbarEl.find('.subnavbar').length) {
        page.$el.addClass('page-with-subnavbar');
      }
      if (page.$el.find('.subnavbar').length) {
        page.$el.addClass('page-with-subnavbar');
      }
    },
  },
};

class TouchRipple {
  constructor($el, x, y) {
    const ripple = this;
    if (!$el) return undefined;
    const box = $el[0].getBoundingClientRect();
    const center = {
      x: x - box.left,
      y: y - box.top,
    };
    const width = box.width;
    const height = box.height;
    const diameter = Math.max((((height ** 2) + (width ** 2)) ** 0.5), 48);

    ripple.$rippleWaveEl = $(`<div class="ripple-wave" style="width: ${diameter}px; height: ${diameter}px; margin-top:-${diameter / 2}px; margin-left:-${diameter / 2}px; left:${center.x}px; top:${center.y}px;"></div>`);

    $el.prepend(ripple.$rippleWaveEl);

    /* eslint no-underscore-dangle: ["error", { "allow": ["_clientLeft"] }] */
    ripple._clientLeft = ripple.$rippleWaveEl[0].clientLeft;

    ripple.rippleTransform = `translate3d(${-center.x + (width / 2)}px, ${-center.y + (height / 2)}px, 0) scale(1)`;

    ripple.$rippleWaveEl.transform(ripple.rippleTransform);

    return ripple;
  }
  onRemove() {
    let ripple = this;
    ripple.$rippleWaveEl.remove();
    Object.keys(ripple).forEach((key) => {
      ripple[key] = null;
      delete ripple[key];
    });
    ripple = null;
  }
  remove() {
    const ripple = this;
    if (ripple.removing) return;
    const $rippleWaveEl = this.$rippleWaveEl;
    const rippleTransform = this.rippleTransform;
    let removeTimeout = Utils.nextTick(() => {
      ripple.onRemove();
    }, 400);
    ripple.removing = true;
    $rippleWaveEl
      .addClass('ripple-wave-fill')
      .transform(rippleTransform.replace('scale(1)', 'scale(1.01)'))
      .transitionEnd(() => {
        clearTimeout(removeTimeout);
        Utils.nextFrame(() => {
          $rippleWaveEl
            .addClass('ripple-wave-out')
            .transform(rippleTransform.replace('scale(1)', 'scale(1.01)'));

          removeTimeout = Utils.nextTick(() => {
            ripple.onRemove();
          }, 700);

          $rippleWaveEl.transitionEnd(() => {
            clearTimeout(removeTimeout);
            ripple.onRemove();
          });
        });
      });
  }
}

var TouchRipple$1 = {
  name: 'touch-ripple',
  static: {
    TouchRipple,
  },
  create() {
    const app = this;
    app.touchRipple = {
      create(...args) {
        return new TouchRipple(...args);
      },
    };
  },
};

const openedModals = [];
const dialogsQueue = [];
function clearDialogsQueue() {
  if (dialogsQueue.length === 0) return;
  const dialog = dialogsQueue.shift();
  dialog.open();
}
class Modal extends Framework7Class {
  constructor(app, params) {
    super(params, [app]);

    const modal = this;

    const defaults = {};

    // Extend defaults with modules params
    modal.useModulesParams(defaults);

    modal.params = Utils.extend(defaults, params);

    // Install Modules
    modal.useModules();

    return this;
  }
  onOpen() {
    const modal = this;
    openedModals.push(modal);
    $('html').addClass(`with-modal-${modal.type.toLowerCase()}`);
    modal.$el.trigger(`modal:open ${modal.type.toLowerCase()}:open`, modal);
    modal.emit(`local::open modalOpen ${modal.type}Open`, modal);
  }
  onOpened() {
    const modal = this;
    modal.$el.trigger(`modal:opened ${modal.type.toLowerCase()}:opened`, modal);
    modal.emit(`local::opened modalOpened ${modal.type}Opened`, modal);
  }
  onClose() {
    const modal = this;
    if (!modal.type || !modal.$el) return;
    openedModals.splice(openedModals.indexOf(modal), 1);
    $('html').removeClass(`with-modal-${modal.type.toLowerCase()}`);
    modal.$el.trigger(`modal:close ${modal.type.toLowerCase()}:close`, modal);
    modal.emit(`local::close modalClose ${modal.type}Close`, modal);
  }
  onClosed() {
    const modal = this;
    if (!modal.type || !modal.$el) return;
    modal.$el.removeClass('modal-out');
    modal.$el.hide();
    modal.$el.trigger(`modal:closed ${modal.type.toLowerCase()}:closed`, modal);
    modal.emit(`local::closed modalClosed ${modal.type}Closed`, modal);
  }
  open(animateModal) {
    const modal = this;
    const app = modal.app;
    const $el = modal.$el;
    const $backdropEl = modal.$backdropEl;
    const type = modal.type;
    let animate = true;
    if (typeof animateModal !== 'undefined') animate = animateModal;
    else if (typeof modal.params.animate !== 'undefined') {
      animate = modal.params.animate;
    }

    if (!$el || $el.hasClass('modal-in')) {
      return modal;
    }

    if (type === 'dialog' && app.params.modal.queueDialogs) {
      let pushToQueue;
      if ($('.dialog.modal-in').length > 0) {
        pushToQueue = true;
      } else if (openedModals.length > 0) {
        openedModals.forEach((openedModal) => {
          if (openedModal.type === 'dialog') pushToQueue = true;
        });
      }
      if (pushToQueue) {
        dialogsQueue.push(modal);
        return modal;
      }
    }

    const $modalParentEl = $el.parent();
    const wasInDom = $el.parents(document).length > 0;
    if (app.params.modal.moveToRoot && !$modalParentEl.is(app.root)) {
      app.root.append($el);
      modal.once(`${type}Closed`, () => {
        if (wasInDom) {
          $modalParentEl.append($el);
        } else {
          $el.remove();
        }
      });
    }
    // Show Modal
    $el.show();

    // Set Dialog offset
    if (type === 'dialog') {
      $el.css({
        marginTop: `${-Math.round($el.outerHeight() / 2)}px`,
      });
    }

    // Emit open
    /* eslint no-underscore-dangle: ["error", { "allow": ["_clientLeft"] }] */
    modal._clientLeft = $el[0].clientLeft;

    // Backdrop
    if ($backdropEl) {
      $backdropEl[animate ? 'removeClass' : 'addClass']('not-animated');
      $backdropEl.addClass('backdrop-in');
    }
    // Modal
    function transitionEnd() {
      if ($el.hasClass('modal-out')) {
        modal.onClosed();
      } else if ($el.hasClass('modal-in')) {
        modal.onOpened();
      }
    }
    if (animate) {
      $el
        .animationEnd(() => {
          transitionEnd();
        });
      $el
        .transitionEnd(() => {
          transitionEnd();
        });
      $el
        .removeClass('modal-out not-animated')
        .addClass('modal-in');
      modal.onOpen();
    } else {
      $el.removeClass('modal-out').addClass('modal-in not-animated');
      modal.onOpen();
      modal.onOpened();
    }

    return modal;
  }
  close(animateModal) {
    const modal = this;
    const $el = modal.$el;
    const $backdropEl = modal.$backdropEl;

    let animate = true;
    if (typeof animateModal !== 'undefined') animate = animateModal;
    else if (typeof modal.params.animate !== 'undefined') {
      animate = modal.params.animate;
    }

    if (!$el || !$el.hasClass('modal-in')) {
      return modal;
    }

    // backdrop
    if ($backdropEl) {
      $backdropEl[animate ? 'removeClass' : 'addClass']('not-animated');
      $backdropEl.removeClass('backdrop-in');
    }

    // Modal
    $el[animate ? 'removeClass' : 'addClass']('not-animated');
    function transitionEnd() {
      if ($el.hasClass('modal-out')) {
        modal.onClosed();
      } else if ($el.hasClass('modal-in')) {
        modal.onOpened();
      }
    }
    if (animate) {
      $el
        .animationEnd(() => {
          transitionEnd();
        });
      $el
        .transitionEnd(() => {
          transitionEnd();
        });
      $el
        .removeClass('modal-in')
        .addClass('modal-out');
      // Emit close
      modal.onClose();
    } else {
      $el
        .addClass('not-animated')
        .removeClass('modal-in')
        .addClass('modal-out');
      // Emit close
      modal.onClose();
      modal.onClosed();
    }

    if (modal.type === 'dialog') {
      clearDialogsQueue();
    }

    return modal;
  }
  destroy() {
    const modal = this;
    if (modal.destroyed) return;
    modal.emit(`local::beforeDestroy modalBeforeDestroy ${modal.type}BeforeDestroy`, modal);
    if (modal.$el) {
      modal.$el.trigger(`modal:beforedestroy ${modal.type.toLowerCase()}:beforedestroy`, modal);
      if (modal.$el.length && modal.$el[0].f7Modal) {
        delete modal.$el[0].f7Modal;
      }
    }
    Utils.deleteProps(modal);
    modal.destroyed = true;
  }
}

class CustomModal extends Modal {
  constructor(app, params) {
    const extendedParams = Utils.extend({
      backdrop: true,
      closeByBackdropClick: true,
      on: {},
    }, params);

    // Extends with open/close Modal methods;
    super(app, extendedParams);

    const customModal = this;

    customModal.params = extendedParams;

    // Find Element
    let $el;
    if (!customModal.params.el) {
      $el = $(customModal.params.content);
    } else {
      $el = $(customModal.params.el);
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal;
    }

    if ($el.length === 0) {
      return customModal.destroy();
    }
    let $backdropEl;
    if (customModal.params.backdrop) {
      $backdropEl = app.root.children('.custom-modal-backdrop');
      if ($backdropEl.length === 0) {
        $backdropEl = $('<div class="custom-modal-backdrop"></div>');
        app.root.append($backdropEl);
      }
    }

    function handleClick(e) {
      if (!customModal || customModal.destroyed) return;
      if ($backdropEl && e.target === $backdropEl[0]) {
        customModal.close();
      }
    }

    customModal.on('customModalOpened', () => {
      if (customModal.params.closeByBackdropClick && customModal.params.backdrop) {
        app.on('click', handleClick);
      }
    });
    customModal.on('customModalClose', () => {
      if (customModal.params.closeByBackdropClick && customModal.params.backdrop) {
        app.off('click', handleClick);
      }
    });

    Utils.extend(customModal, {
      app,
      $el,
      el: $el[0],
      $backdropEl,
      backdropEl: $backdropEl && $backdropEl[0],
      type: 'customModal',
    });

    $el[0].f7Modal = customModal;

    return customModal;
  }
}

var Modal$1 = {
  name: 'modal',
  static: {
    Modal,
    CustomModal,
  },
  create() {
    const app = this;
    app.customModal = {
      create(params) {
        return new CustomModal(app, params);
      },
    };
  },
  params: {
    modal: {
      moveToRoot: true,
      queueDialogs: true,
    },
  },
};

var Card = {
  name: 'card',
};

// Install Core Modules & Components
Framework7.use([
  DeviceModule,
  SupportModule,
  UtilsModule,
  ResizeModule,
  RequestModule,
  TouchModule,
  ClicksModule,
  Router$1,
  HistoryModule,
  StorageModule,
  Statusbar$1,
  View$1,
  Navbar$1,
  Toolbar$1,
  Subnavbar,
  TouchRipple$1,
  Modal$1,
  Card
]);

export default Framework7;
export { Request, Utils, Device, Support };
