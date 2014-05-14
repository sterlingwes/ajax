var nativeForEach = Array.prototype.forEach,
    breaker,

utils = {
    
    extend: function (o) {
        utils.each(Array.prototype.slice.call(arguments, 1), function (a) {
        for (var p in a) if (a[p] !== void 0) o[p] = a[p];
        });
        return o;
    },
            
    each: function (o, fn, ctx) {
          if (o === null) return;
          if (nativeForEach && o.forEach === nativeForEach)
              o.forEach(fn, ctx);
          else if (o.length === +o.length) {
              for (var i = 0, l = o.length; i < l; i++)
                  if (i in o && fn.call(ctx, o[i], i, o) === breaker) return;
          } else {
              for (var key in o)
                  if (hasOwnProperty.call(o, key))
                      if (fn.call(ctx, o[key], key, o) === breaker) return;
          }
      }
    
};

module.exports = utils;