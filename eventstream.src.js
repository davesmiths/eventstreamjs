// Custom events
(function(context, undefined) {

    'use strict';

    // Thanks to Crockford
    if (typeof Object.create !== 'function') {
        Object.create = function (o) {
            function F() {}
            F.prototype = o;
            return new F();
        };
    }

    var typeOf = function(o) {
        return ({}).toString.call(o).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    };

    var wrap = function() {

        var evntstream,
            evnts = {},
            history = {};

        evntstream = {

            _call: function(o) {

                var id = o.id,
                    anything = o.anything,
                    e = {id:id},
                    i,
                    j,
                    evntArray = evnts[id],
                    evntArrayLength,
                    date,
                    callback;

                // if evnts[id] does not exist do nothing
                if (evntArray === undefined) {
                    evntArray = evnts[id] = [];
                }

                evntArrayLength = evntArray.length;

                date = new Date() * 1;

                history[date] = history[date] || [];

                history[date].push({id:id, anything:anything});

console.log(history);

                if (evntArrayLength) {

                    for (i = 0; i < evntArrayLength; i++) {

                        callback = false;

                        for (j = 0; j < evntArray[i].ns.length; j++) {
                            if (evntArray[i].ns[j] === this) {
                                callback = true;
                            }
                        }

                        if (callback) {
                            evntArray[i].callback(e, anything);
                        }

                    }

                }

            },

            _when: function(o) {

                var id = o.id,
                    fn = o.fn,
                    now = o.now,
                    evntArray,
                    evntArrayLength,
                    evntArrayExisted,
                    callback,
                    evnt,
                    i;

                now = now === undefined ? false : now;

                evntArrayExisted = evnts[id] !== undefined;

                evntArray = evnts[id] = evnts[id] || [];

                // If the callback fn exists add the handler
                if (fn) {

                    evnt = {
                        callback:fn,
                        ns:this.nsArray.slice(),
                        created:new Date() * 1
                    };
                    evntArray.push(evnt);

                    // Truth table: https://docs.google.com/spreadsheets/d/1yrLzB-RQcm5TArhgmG-g2jQt4VrBK51gkTWet0hA2QU/edit#gid=0
                    if (o.from < 0) {
                        if (o.to >= 0) {
                            // Add handler
                            // Call fn if already fired
                            if (o.to !== Number.POSITIVE_INFINITY) {
                                // Remove handler
                                // Call fallback?
                            }
                        }
                        else if (o.to !== Number.NEGATIVE_INFINITY) {
                            // Call fn if already fired
                            // Call fallback?
                        }
                    }
                    else if (o.from !== Number.POSITIVE_INFINITY) {
                        if (o.to >= 0) {

                            // Add handler with delay

                            if (o.to !== Number.POSITIVE_INFINITY) {
                                // Remove handler
                                // Call fallback?
                            }

                        }
                    }

                    if (typeOf(o.to) === 'number') {
                        // If to is a number and greater than 0 then it will need removing
                        if (o.to > 0 && o.from === false) {
                            setTimeout(function() {
                                // Remove handler by replacing with a noop
                                evnt.callback = function(){};
                                //this.call(id, o.fall);
                                // if there has been no calls, call the fallback
                                // if there has been calls, do nothing
                            }, o.to);
                        }
                        else {
                            // if there were no calls, call the fallback
                            // if there were calls, call the callback
                        }
                    }
                    if (now && evntArrayExisted) {
                        this.call(id, fn);
                    }
                    // slice() to make sure a copy of the array is used, not a reference to the original object
                }
                // Else remove the event handler
                else {

                    // if evntArray does not exist do nothing
                    if (evntArray !== undefined) {

                        evntArrayLength = evntArray.length;

                        for (i = evntArrayLength - 1; i > -1; i--) {

                            // Check if the namespace is ok
                            callback = false;

                            if (evntArray[i].ns[evntArray[i].ns.length - 1] === this) {
                                callback = true;
                            }
                            if (callback) {
                                evntArray.splice(i, 1);
                            }

                        }

                    }

                }
            },
            new: function(separateStream) {
                var next;
                if (separateStream === true) {
                    next = wrap();
                }
                // Else create a sub-stream
                else {
                    next = Object.create(this);
                    // Add the namespace object to the namespace array, but not update any existing arrays
                    next.nsArray = (this.nsArray) ? this.nsArray.slice() : [];
                    next.nsArray.push(next);
                }
                return next;
            }


        };

        // Add the evntstream object to an index of namespaces
        evntstream.nsArray = [evntstream];

        // Handlers
        evntstream.if = evntstream.on = evntstream.off = evntstream.when = function(a,b,c,d,e) {
            var o = {id:a,to:Number.POSITIVE_INFINITY,from:0,fn:function(){},fall:function(){}};
            if (typeOf(b) === 'boolean') {
                b = b ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
            }
            if (typeOf(b) === 'number') {
                o.to = b;
                b=c;c=d;d=e;
            }
            if (typeOf(b) === 'boolean') {
                b = b ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
            }
            if (typeOf(b) === 'number') {
                o.from = b;
                b=c;c=d;
            }
            o.fn = b;
            o.fall = c;
            evntstream._when(o);
        };

        // Triggers
        evntstream.do = evntstream.trigger = evntstream.call = function(id, anything) {
            evntstream._call({
                id:id,
                anything:anything
            });
        };

        return evntstream;

    };

    context.evntstream = wrap();


    // A wee bit of testing
    var a = context.evntstream;
    var b = a.new('b');
    var c = b.new('c');
    var bb = a.new('bb');
    var z = c.new(true);
    console.log(context.evntstream);
    console.log(a);
    console.log(b);
    console.log(c);
    console.log(bb);

    //a.call('the door opens', 'a made the call before a handler was set'); // Should not fire
    //b.call('the door opens', 'b made the call before a handler was set'); // Should not fire
    //bb.call('the door opens', 'bb made the call before a handler was set'); // Should not fire
    c.call('the door opens', 'c made the call before a handler was set'); // Should not fire

    //a.if('the door opens', 5000, function(e, data) {
    //    console.log('door opened ns a, ', data);
    //});
    a.when('the door opens', function(e, data) {
        console.log('door opened ns a, ', data);
    });
    a.when('the door opens', function(e, data) {
        console.log('door opened ns a2, ', data);
    });
    b.when('the door opens', function(e, data) {
        console.log('door opened ns b, ', data);
    });
    c.when('the door opens', function(e, data) {
        console.log('door opened ns c, ', data);
    });
    z.when('the door opens', function(e, data) {
        console.log('door opened ns z, ', data);
    });

    a.call('the door opens', 'a made the call'); // Should fire
    b.call('the door opens', 'b made the call'); // Should fire
    bb.call('the door opens', 'bb made the call'); // Should not fire
    c.call('the door opens', 'c made the call'); // Should not fire

    c.when('the door opens', function() {console.log('second c');});
    b.when('the door opens');
    a.call('the door opens', 'a made the call after removing b'); // Should fire two c but no b
    z.call('the door opens', 'z made the call'); // Should fire two c but no b

    a.when('the door is opened', function() {});
    a.on('the door being opened', function() {});
    a.call('the door being opened', function() {});


    //a.when('bob',8,-8,fn,fall);
    //a.when('bob',5000,fn,fall); // keep handler in place for 5 seconds
    //a.when('bob',5000,-8,fn,fall); // keep handler in place for 5 seconds, and trigger if already called
    //a.when('bob',5000,-5000,fn,fall); // keep handler in place for 5 seconds, and trigger if already called in the last 5 seconds
    // 8 used because it is similar to the infinity sign, and who is going to set something to +-8ms?

    //var $ = {ajax:function(){return {done:function(){}};}};
    //$.ajax('some.json').done(function() {
    //    es.trigger('ajax loaded');
    //    es.call('ajax loaded');
    //    es.do('ajax loaded');
    //    //es.fire('ajax loaded');
    //    //es.trip('ajax loaded');
    //});

    //es.when('ajax loaded', function() {
    //});
    //es.on('ajax loaded', function() {
    //});
    //// Could be slightly different than the others, in that if "ajax loaded" has
    //// been fired already then it will do something
    //// This is different to when and on, which only do something when "ajax loaded"
    //// is fired
    //es.if('ajax loaded', function() {
    //});



    // To do
    // if
    // Fresh copy of evntstream for a completely separate stream


}(this));

/*







Add
    js.when('bob opens the door', 'do this')
    js.on('bob opens the door', 'do this')

Clear
    js.when('bob opens the door', 'do nothing')
    js.when('bob opens the door', null|0|false|undefined)

Trigger
    js.do('bob opens the door', 'he's wearing green!');


Namespaced

Add
    js('sue').when('bob opens the door', 'do this')
    js('imagefill').when('bob opens the door', function() {})

Clear
    js('sue').when('bob opens the door', 'do nothing')
    js('harry').when('bob opens the door', null|0|false|undefined)
    js('imagefill').when('bob opens the door')

Trigger
    js('sue').do('bob opens the door', 'he's wearing green!');




js.bob => 1;
js('sue')


'bob opens the door'
    all handlers are fired
sue('bob opens the door')
    sue handlers are fired and all sub-sue handlers







*/
