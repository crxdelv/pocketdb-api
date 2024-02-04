module.exports = async (token) => {
  if (token != null) {
    // use existing database
    try {
      var req = await fetch(`https://api.telegra.ph/getPageList?access_token=${token}&limit=200`);
      req = await req.json();
    } catch(e) {
      throw `Failed to connect (${e})`;
    }
    if (req.ok != true) throw `Failed to connect (${req.error})`;
  } else {
    try {
      var req = await fetch(`https://api.telegra.ph/createAccount?short_name=${Math.random()}`);
      req = await req.json();
    } catch(e) {
      throw `Failed to connect (${e})`;
    }
    if (req.ok != true) throw `Failed to connect (${req.error})`;
    // set the access token
    token = req.result.access_token;
  }
  var cache = [];
  var list = [];
  (req.result.pages || []).forEach(page => {
    list.push(page.title);
    cache.push({
      title: page.title,
      path: page.path
    });
  });
  return {
    cache,
    list,
    token,
    async set(key, val) {
      // parse the value
      var content = JSON.stringify([{
        tag: "p",
        children: [btoa(escape(this.compress(JSON.stringify(val))))]
      }]);
      if (this.list.includes(key)) {
        // edit a page
        var path = this.cache.find(i => i.title == key).path;
        try {
          var req = await fetch(`https://api.telegra.ph/editPage?access_token=${token}&title=${encodeURI(key)}&path=${path}&content=${encodeURI(content)}`);
          req = await req.json();
        } catch(e) {
          throw `Failed to perform the operation (${e})`;
        }
        if (req.ok != true) throw `Failed to perform the operation (${req.error})`;
        var that = this;
        this.cache.forEach(function(c, i) {
          if (c.title == key) {
            that.cache[i].content = val;
          }
        });
      } else {
        // create new page
        try {
          var req = await fetch(`https://api.telegra.ph/createPage?access_token=${token}&title=${encodeURI(key)}&content=${encodeURI(content)}`);
          req = await req.json();
        } catch(e) {
          throw `Failed to perform the operation (${e})`;
        }
        if (req.ok != true) throw `Failed to perform the operation (${req.error})`;
        // update the cache and list
        this.cache.push({
          title: req.result.title,
          path: req.result.path,
          content: val
        });
        this.list.push(req.result.title);
      }
    },
    async get(key, def, nocache) {
      // if the key does not exist on the list, return the default value
      if (!this.list.includes(key)) return def;
      // find the cache
      var cache = this.cache.find(i => i.title == key);
      // if nocache is not true and the cache exists, use the cache
      if (!nocache && cache?.content != null) {
        return cache.content;
      }
      // get the page
      try {
        var req = await fetch(`https://api.telegra.ph/getPage?access_token=${token}&path=${cache.path}&&return_content=true`);
        req = await req.json();
      } catch(e) {
        throw `Failed to perform the operation (${e})`;
      }
      if (req.ok != true) throw `Failed to perform the operation (${req.error})`;
      // parse the content
      var val = JSON.parse(this.decompress(unescape(atob(req.result.content[0].children[0]))));
      // update the cache
      var that = this;
      this.cache.forEach(function(c, i) {
        if (c.title == key) {
          that.cache[i].content = val;
        }
      });
      return val;
    },
    decompress(t) {
      function unpair(n) {
        var w = Math.floor((Math.sqrt(8 * n + 1) - 1) / 2);
        var t = (w ** 2 + w) / 2;
        return [w - (n - t), n - t];
      }
      return t.split("").map(i => {
        var p = unpair(i.charCodeAt(0));
        return String.fromCharCode(p[0] - 1) + (p[1] == 0 ? "": String.fromCharCode(p[1] - 1));
      }).join("");
    },
    compress(t) {
      function pair(a, b) {
        return 0.5 * (a + b) * (a + b + 1) + b;
      }
      return new Array(Math.ceil(t.length / 2)).fill(0).map((_, i) => String.fromCharCode(pair(t.charCodeAt(i * 2) + 1, t.charCodeAt(i * 2 + 1) + 1 || 0))).join("");
    }
  }
}

