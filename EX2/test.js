function tests(property,
               propEqual,
               jsc,
               arbs,
               xmlParser) {

    // simple utility functions
    function words(s) { return _.words(s, /[^\s]+/g); }
    function compose(f, g) { return x => f(g(x)); }
    function vectorSum(arr1,arr2) { return _.zipWith(arr1, arr2, _.add); }

    window.vectorSum = vectorSum

    // how to generate sentences (for mkPrettyPrinter & mkIndenter)
    let sentence =
        // words are 2-12 lower letters
        arbs.sentence(arbs.word(arbs.lLetter,2,12),
                      // prefer white space between words
                      arbs.oneOfWeight([arbs.whitespace, 8],
                                       // but rarely put '\n'
                                       [jsc.constant('\n'), 1]),
                      // prefer no leading whitespace
                      arbs.oneOfWeight([jsc.constant(''), 3],
                                       // but sometimes add some
                                       [arbs.whitespace, 1]),
                      // slightly prefer adding trailing whitespace
                      arbs.oneOfWeight([arbs.whitespace, 2],
                                       // but sometimes don't
                                       [jsc.constant(''), 1]),
                      // use '.', '!', '?' or '...' at the end
                      arbs.punctuation,
                      // sentence has 5 to 30 words
                      5,
                      30);

    test("Scalar product", function() {
        property(
            "doesn't change the source array",
            "array number", "number",
            function (arr,num) {
                let copy = _.cloneDeep(arr);
                let t = scalar_product(copy,num);
                return propEqual(copy, arr, `scalar_product([${copy}],${num})`, `[${arr}]`);
            });
        property(
            "preserves the length of the array",
            "array number", "number",
            function (arr,num) {
                return propEqual(scalar_product(arr,num).length, arr.length, `scalar_product([${arr}],${num}).length`, `${arr}.length`);
            });
        property(
            "returns zero array if the factor is zero",
            "array number",
            function (arr) {
	              let z = _.cloneDeep(arr);
	              _.fill(z,0);
	              return propEqual(scalar_product(arr,0),z, `scalar_product([${arr}],0)`, `[${z}]`);
            });
        property(
            "preserves the array if the factor is one",
            "array number",
            function (arr) {
	              let c = _.cloneDeep(arr);
	              return propEqual(scalar_product(arr,1),c, `scalar_product([${arr}],1))`, `[${c}]`);
            });
        // have to restrict it to integers because of the rounding errors
        // better to compare up to rounding error
        property(
            "allows factors to be combined",
            "array integer", "integer", "integer",
            function (arr, n1, n2) {
                return propEqual(scalar_product(scalar_product(arr,n1),n2),
                                 scalar_product(arr, n1*n2), `scalar_product(scalar_product([${arr}],${n1}),${n2})`, `scalar_product([${arr}], ${n1}*${n2})`);
            });
        property(
            "returns undefined if first argument is not an array",
            jsc.suchthat(arbs.anything, x => !_.isArray(x)), arbs.anything,
            function(notArr, x) {
                return propEqual(scalar_product(notArr, x), undefined, `scalar_product(${notArr}, ${x})`, `undefined`);
            });
        property(
            "if factor is not passed, array is returned as is",
            "array number",
            function(arr) {
                return propEqual(scalar_product(arr), arr, `scalar_product([${arr}])`, `[${arr}]`);
            });
    });

    test("Inner product", function() {
        property(
            "doesn't change the source arrays",
            arbs.equalLengthArrays(jsc.number, jsc.number),
            function (arrs) {
                let [a1,a2] = arrs;
                let copy1 = _.cloneDeep(a1);
                let copy2 = _.cloneDeep(a2);
                var t = inner_product(a1,a2);
                return propEqual(a1,copy1) && propEqual(a2,copy2);
            });
        property(
            "is symmetric",
            arbs.equalLengthArrays(jsc.number, jsc.number),
            function (arrs) {
                let [a1,a2] = arrs;
                return propEqual(inner_product(a1,a2), inner_product(a2,a1), `inner_product([${a1}],[${a2}])`, `inner_product([${a2}],[${a1}])`);
            });
        property(
            "returns non-negative number when multiplying vector to itself",
            "array number",
            function (arr) {
                return inner_product(arr,arr) >= 0;
            });
        property(
            "returns 0 if one of the vectors is a zero-filled [0,...,0] vector",
            "array number",
            function (arr) {
                let z = new Array(arr.length);
                _.fill(z,0);
                return propEqual(inner_product(arr,z), 0, `inner_product([${arr}],[${z}])`, `0`);
            });
        property(
            "if argument arrays sizes don't match, returns undefined",
            jsc.array(arbs.anything),
            function(arr1) {
                return jsc.forall(
                    jsc.suchthat(jsc.array(arbs.anything),
                                 x => x.length !== arr1.length),
                    function(arr2) {
                        return propEqual(inner_product(arr1,arr2), undefined, `inner_product([${arr1}],[${arr2}])` , `undefined`);
                    });
            });
    });

    test("mapReduce", function() {
        // mapReduce is pretty agnostic to the array contents
        // so we could use "json" arbitrary instead of "number"
        // to get better coverage
        // Unfortunately, it is also quite slower
        property(
            "doesn't change the source array",
            "array integer", "integer -> integer",
            function (arr, f) {
                let copy = _.cloneDeep(arr);
                let t = mapReduce(copy, f);
                return propEqual(copy, arr, `[${copy}]`,`[${arr}]`);
            });
        property(
            "mapReduce([],f,g,seed) == seed",
            "integer -> integer", arbs.fn2(jsc.integer), "integer",
            function(f, combine, seed) {
                return propEqual(mapReduce([],f,combine,seed), seed, `mapReduce([],${f},${combine},${seed})`, `${seed}`);
            });
        property(
            "mapReduce(arr,identity,combine,seed) == reduce(arr,combine,seed)",
            "array integer", arbs.fn2(jsc.integer), "integer",
            function (arr, combine, seed) {
                return propEqual(mapReduce(arr,_.identity,combine,seed),
                                 _.reduce(arr,combine,seed), `mapReduce([${arr}],${_.identity},${combine},${seed})`, `_.reduce([${arr}],${combine},${seed})`);
            });
        property(
            "mapReduce(arr,f,combine,seed) == " +
                "mapReduce(arr,identity,(a,x) => combine(a,f(x)),f(seed))",
            "array integer", "integer -> integer", arbs.fn2(jsc.integer),
            "integer",
            function (arr, f, combine, seed) {
                return propEqual(
                    mapReduce(arr,f,combine,seed),
                    mapReduce(arr,_.identity,(a,x) => combine(a,f(x)),seed), `mapReduce([${arr}],${f},${combine},${seed})`, `mapReduce([${arr}],${_.identity},(a,x) => ${combine}(a,${f}(x)),${seed})`);
            });
        property(
            "mapReduce(arr1.concat(arr2),f) == mapReduce(arr1,f) + mapReduce(arr2,f)",
            "array integer", "array integer", "integer -> integer",
            function (arr1, arr2, f) {
                return propEqual(
                    mapReduce(arr1.concat(arr2),f),
                    mapReduce(arr1,f) + mapReduce(arr2,f), `mapReduce([${arr1}].concat([${arr2}]),${f})`, `mapReduce([${arr1}],${f}) + mapReduce([${arr2}],${f})`);
            });
        property(
            "mapReduce(arr1.concat(arr2),f,+,0) == " +
                "mapReduce(arr1,f,+,0) + mapReduce(arr2,f,+,0)",
            "array integer", "array integer", "integer -> integer",
            function (arr1, arr2, f) {
                return propEqual(
                    mapReduce(arr1.concat(arr2),f, _.add, 0),
                    mapReduce(arr1,f,_.add,0) + mapReduce(arr2,f,_.add,0), `mapReduce([${arr1}].concat([${arr2}]),${f}, ${_.add}, 0)`, `mapReduce([${arr1}],${f},${_.add},0) + mapReduce([${arr2}],${f},${_.add},0)`);
            });
        property(
            "mapReduce(arr,f,(a,x) => a.concat([x]),[]) == map(arr,f)",
            "array integer", "integer -> integer",
            function (arr, f) {
                return propEqual(mapReduce(arr,f,(a,x) => a.concat([x]), []),
                                 _.map(arr,f), `mapReduce([${arr}],${f},(a,x) => a.concat([x]), [])`, `${_.map(arr,f)}`);
            });
        property(
            "mapReduce(arr,f,(a,x) => a.concat(x),[]) == flatMap(arr,f)",
            "array integer", "integer -> array integer",
            function (arr,f) {
                return propEqual(mapReduce(arr,f,(a,x) => a.concat(x),[]),
                                 _.flatMap(arr,f), `mapReduce([${arr}],${f},(a,x) => a.concat(x),[])`,
                                 `[${_.flatMap(arr,f)}]`);
            });
        property(
            "mapReduce([1,2,3],f,g,0) == g(g(g(0,f(1)),f(2)),f(3))",
            "integer -> integer", arbs.fn2(jsc.integer),
            function (f, g) {
                return propEqual(mapReduce([1,2,3],f,g,0),
                                 g(g(g(0,f(1)),f(2)),f(3)), `mapReduce([1,2,3],${f},${g},0)`, `${g(g(g(0,f(1)),f(2)),f(3))}`);
            });
        property(
            "if the first argument is not an array, returns undefined",
            jsc.suchthat(arbs.anything, x => !Array.isArray(x)),
            "number -> number",
            function(notArr, f) {
                return propEqual(mapReduce(notArr,f), undefined);
            });
        property(
            "if the second argument is not a function, returns undefined",
            "array integer", jsc.suchthat(arbs.anything, x => typeof x !== 'function'),
            function(arr, notF) {
                return propEqual(mapReduce(arr,notF), undefined);
            });
        });

    test("mergeSortedArrays", function() {
        property(
            "doesn't change the source arrays",
            arbs.sortedArray(jsc.integer), arbs.sortedArray(jsc.integer),
            function(a, b) {
                let copy1 = _.cloneDeep(a);
                let copy2 = _.cloneDeep(b);
                let t = mergeSortedArrays(copy1,copy2);
                return propEqual(copy1,a) && propEqual(copy2,b);
            });
        property(
            "produces sorted results",
            arbs.sortedArray(jsc.integer), arbs.sortedArray(jsc.integer),
            function(a, b) {
                let t = mergeSortedArrays(a,b);
                return propEqual(t, _.sortBy(t), `[${t}]`,`mergeSortedArrays([${a}],[${b}])`);
            });
        property(
            "has length equal to the sum of individual lengths",
            arbs.sortedArray(jsc.integer), arbs.sortedArray(jsc.integer),
            function(a, b) {
                return propEqual(mergeSortedArrays(a,b).length, a.length + b.length, `mergeSortedArrays([${a}],[${b}]).length`, `[${a}].length + [${b}].length`);
            });
        });

    test("range", function() {
        property(
            "results in undefined if step is zero",
            "integer", "integer",
            function(x,y) {
                return propEqual(range(x,y,0), undefined, `range(${x},${y},0)`, undefined, `[${range(x,y,0)}]`);
            });
        property(
            "results in empty array if x > y and step > 0 or x < y and step < 0",
            "integer",
            function(x) {
                return jsc.forall(
                    jsc.suchthat(jsc.integer, y => y != x), arbs.posInteger,
                    function(y,stepMod) {
                        let s = x>y ? stepMod : -stepMod
                        return propEqual(range(x,y,s), [], `range(${x},${y},${s})`, undefined, `[${range(x,y,s)}]`);
                    });
            });
        property(
            "produces array without repetitions",
            "integer", "integer", jsc.suchthat(jsc.integer, x => x != 0),
            function(x,y,step) {
                let r = range(x,y,step);
                return propEqual(r.length, _.uniq(r).length, `range(${x},${y},${step})`, undefined, `[${range(x,y,step)}]`);
            });
        property(
            "produces array with all elements >= min(x,y)",
            "integer", "integer", jsc.suchthat(jsc.integer, x => x != 0),
            function(x,y,step) {
                let r = range(x,y,step);
                let l = _.min([x,y]);
                return propEqual(_.every(r,a => a >= l), true, `range(${x},${y},${step})`, undefined, `[${range(x,y,step)}]`);
            });
        property(
            "produces array with all elements <= max(x,y)",
            "integer", "integer", jsc.suchthat(jsc.integer, x => x != 0),
            function(x,y,step) {
                let r = range(x,y,step);
                let h = _.max([x,y]);
                return propEqual(_.every(r,a => a <= h), true, `range(${x},${y},${step})`, undefined, `[${range(x,y,step)}]`);
            });
        property(
            "returns undefined, if either argument is not a number",
            "number", "number", jsc.suchthat(jsc.number, x => x != 0),
            jsc.suchthat(arbs.anything, x => !_.isNumber(x) || _.isNaN(x)),
            jsc.suchthat(arbs.anything, x => !_.isNumber(x) || _.isNaN(x)),
            jsc.suchthat(arbs.anything, x => !_.isNumber(x) || _.isNaN(x)),
            jsc.suchthat(arbs.anything, x => !_.isUndefined(x) &&
                         (!_.isNumber(x) || _.isNaN(x))),
            function(x,y,step,nN1,nN2,nN3,nN4) {
                return propEqual(range(nN1,nN2,step), undefined) &&
                    propEqual(range(nN1,y,step), undefined) &&
                    propEqual(range(x,nN2,step), undefined) &&
                    propEqual(range(nN1,nN2,nN3), undefined) &&
                    propEqual(range(x,y,nN4), undefined) &&
                    propEqual(range(nN1,y,nN3), undefined) &&
                    propEqual(range(x,nN2,nN3), undefined);
            });
    });

    test("flatten", function() {
        property(
            "doesn't change the input array",
            "array json",
            function(a) {
                let copy = _.cloneDeep(a);
                let t = flatten(copy);
                return propEqual(copy, a, `flatten([${a}])`);
            });
        property(
            "simply returns the input, if it is not an array",
            jsc.oneof(jsc.number, jsc.bool, jsc.falsy, jsc.string),
            function(inp) {
                return propEqual(flatten(inp), inp, `flatten(${inp})`);
            });
        property(
            "simply returns the input, if it is already flattened",
            jsc.array(jsc.oneof(jsc.number, jsc.bool, jsc.falsy, jsc.string)),
            function(a) {
                return propEqual(flatten(a), a, `flatten([${a}])`, `[${a}]`);
            });
        property(
            "flatten([arr]) == flatten(arr)",
            "array json",
            function(a) {
                return propEqual(flatten([a]), flatten(a), `flatten([[${a}]])`, `flatten([${a}])`);
            });
    });

    test("mkPrettyPrinter", function() {
        property(
            "output has no too long lines",
            jsc.integer(20,80), jsc.array(sentence),
            function(ls, input) {
                let inp = input.join('\n');
                let pp = mkPrettyPrinter(ls);
                let r = pp(inp);
                return propEqual(_.every(r, l => l.length <= ls), true, `mkPrettyPrinter(${ls})("${inp.replace(/\n/, '\\n')}")`, undefined, `[${mkPrettyPrinter(ls)(inp)}]`);
            });
        property(
            "output has all input words in the same order",
            jsc.integer(20,80), jsc.array(sentence),
            function(ls, input) {
                let inp = input.join('\n');
                let ws = words(inp);
                let pp = mkPrettyPrinter(ls);
                let r = pp(inp);
                return propEqual(words(r.join('\n')), ws, `mkPrettyPrinter(${ls})("${inp.replace(/\n/, '\\n')}")`, undefined);
            });
        property(
            "output has no leading or trailing white spaces",
            jsc.integer(20,80), jsc.array(sentence),
            function(ls, input) {
                let inp = input.join('\n');
                let pp = mkPrettyPrinter(ls);
                let r = pp(inp);
                return propEqual(_.every(r, l => (l == _.trim(l))), true, `mkPrettyPrinter(${ls})("${inp.replace(/\n/, '\\n')}")`, undefined, `[${mkPrettyPrinter(ls)(inp)}]`);
            });
        property(
            "does not use global variables",
            arbs.vect(jsc.integer(20,80),5),
            arbs.permutation(5), jsc.array(sentence),
            function(lss, perm, input) {
                let inp = input.join('\n');
                let pps = lss.map(mkPrettyPrinter);
                for (let i in perm) {
                    let j = perm[i];
                    let r = pps[j](inp);
                    _.every(r, l => propEqual(l.length <= lss[j], true));
                    pps.splice(j,1);
                    lss.splice(j,1);
                }
                return true;
            });
        property(
            "returns undefined if called with not a number",
            jsc.suchthat(arbs.anything, x => !_.isUndefined(x) &&
                         (!_.isNumber(x) || _.isNaN(x))),
            function(nN) {
                return propEqual(mkPrettyPrinter(nN), undefined, `mkPrettyPrinter(${nN})`);
            });
        property(
            "if pretty-printer is called with non-string, it returns undefined",
            jsc.integer(50,80),
            jsc.suchthat(arbs.anything, x => !_.isString(x)),
            function(ls, nStr) {
                return propEqual(mkPrettyPrinter(ls)(nStr), undefined, `mkPrettyPrinter(${ls})(${nStr})`);
            });
    });

    test("mkIndenter", function() {
        let indenterInput = jsc.oneof(jsc.nat(20), sentence, jsc.array(sentence));
        // it's easier to generate absolute indentation levels
        // and then turn them into relative ones
        function fixIndentationLevels(arr,curLvl) {
            for (let i in arr) {
                if (typeof arr[i] == "number") {
                    let t = arr[i];
                    arr[i] -= curLvl;
                    curLvl = t;
                }
            }
            return curLvl;
        }
        function properlyIndented(il) {
            return l => {
                let b = l.substr(0,il);
                let e = l.slice(il);
                return propEqual(b, ' '.repeat(il)) &&
                    propEqual(e, _.trim(e)) &&
                    ! _.includes(e, '\n') &&
                    ! _.includes(e, '\t') &&
                    ! _.includes(e, '  ');
            };
        }
        function properlyIndentedLI(il) {
            return (l,ix) => {
                let b = l.substr(0,il+2);
                let e = l.slice(il+2);
                let expectedIndent = i ? ' '.repeat(il+2) : ' '.repeat(il) + '* ';
                return propEqual(b, expectedIndent) &&
                    propEqual(e, _.trim(e)) &&
                    ! _.includes(e, '\n') &&
                    ! _.includes(e, '\t') &&
                    ! _.includes(e, '  ');
            };
        }
        function noEarlyWraps(ls, ss, rl, el, ol) {
            let lss = _.initial(ss).map(x => x.length);
            let nexts = _.tail(ss).map(x => words(x)[0].length);
            return propEqual(_.every(_.zipWith(lss,nexts,_.add), s => s >= ls),true,rl,el,ol);
        }

        property(
            "returned function doesn't change its argument",
            jsc.integer(50,80), jsc.nat(12), jsc.array(sentence),
            function(ls, il, arr) {
                let copy = _.cloneDeep(arr);
                let i = mkIndenter(ls, il);
                let t = i(copy);
                return propEqual(copy,arr, `mkIndenter(${ls}, ${il})([${arr}])`);
            });
        property(
            "freshly created indenter returns indentation level passed " +
                "during creation",
            jsc.integer(50,80), jsc.nat(20),
            function(ls, il) {
                let i = mkIndenter(ls, il);
                return propEqual(i(true), il, `mkIndenter(${ls}, ${il})(true)`);
            });
        property(
            "freshly created indenter returns an empty array",
            jsc.integer(50,80), jsc.nat(20),
            function(ls, il) {
                let i = mkIndenter(ls, il);
                return propEqual(i(), [], `mkIndenter(${ls}, ${il})()`);
            });
        property(
            "content request doesn't change the indentation level",
            jsc.integer(50,80), jsc.nat(20), jsc.array(indenterInput),
            function(ls, il, arr) {
                fixIndentationLevels(arr,il);
                let i = mkIndenter(ls, il);
                arr.forEach(i);
                let il2 = i(true);
                i();
                return propEqual(i(true), il2, `var i = mkIndenter(${ls}, ${il});i(true);i(true)`);
            });
        property(
            "output doesn't have too long lines",
            jsc.integer(50,80), jsc.nat(20), jsc.array(indenterInput),
            function(ls, il, arr) {
                fixIndentationLevels(arr,il);
                let i = mkIndenter(ls, il);
                arr.forEach(i);
                let r = i();
                return propEqual(_.every(r, l => l.length <= ls), true, `mkIndenter(${ls}, ${il})()`);
            });
        property(
            "integer input doesn't produce any output and changes the " +
                "indentation level",
            jsc.integer(50,80), jsc.nat(12), jsc.integer(-12,12),
            function(ls, il, int) {
                let i = mkIndenter(ls, il);
                i(int);
                return propEqual(i(true), il + int, `var i = mkIndenter(${ls}, ${il}); i(${int}); i(true); i()`) &&
                    propEqual(i(), [], `var i = mkIndenter(${ls}, ${il}); i(${int}); i(true); i()`);
            });
        property(
            "string input produces properly indented results " +
                "and doesn't change the indentation level",
            jsc.integer(50,80), jsc.nat(20), sentence,
            function(ls, il, s) {
                let i = mkIndenter(ls, il);
                i(s);
                let r = i();
                return propEqual(_.every(r, properlyIndented(il)), true, `var i = mkIndenter(${ls}, ${il}); i("${s}"); i(); i(true)`) &&
                    propEqual(i(true), il, `var i = mkIndenter(${ls}, ${il}); i("${s}"); i(); i(true)`);
            });
        property(
            "string input doesn't wrap lines too early",
            jsc.integer(50,80), jsc.nat(20), sentence,
            function(ls, il, s) {
                let i = mkIndenter(ls, il);
                i(s);
                let r = i();
                return noEarlyWraps(ls, r, `var i = mkIndenter(${ls}, ${il}); i("${s.replace(/\n/, '\\n')}"); i()`, undefined, `[${i()}]`);
            });
        property(
            "empty array input does nothing",
            jsc.integer(50,80), jsc.nat(20),
            function(ls, il) {
                let i = mkIndenter(ls, il);
                i([]);
                return propEqual(i(), [], `var i = mkIndenter(${ls}, ${il}); i([]); i(); i(true)`) && propEqual(i(true), il, `var i = mkIndenter(${ls}, ${il}); i([]); i(); i(true)`);
            });
        property(
            "it doesn't use global variables",
            jsc.integer(2,5),
            function(n) {
                let inputsArb = arbs.vect(jsc.tuple([jsc.integer(50,80),
                                                     jsc.nat(20),
                                                     jsc.array(sentence)]),
                                          n);
                return jsc.forall(
                    inputsArb,
                    function(inputs) {
                        let seqOuts = _.map(inputs, inp => {
                            let i = mkIndenter(inp[0],inp[1]);
                            inp[2].forEach(i);
                            return i();
                        });
                        let sz = _.sum(_.map(inputs, x => x[2].length)) + 2*n;
                        return jsc.forall(
                            arbs.vect(jsc.nat(n-1), sz),
                            function(schedule) {
                                let cnts = _.fill(Array(n), -1);
                                let outs = _.fill(Array(n), undefined);
                                let is = [];
                                schedule.forEach(i_ => {
                                    let i = i_;
                                    for (; cnts[i] > inputs[i][2].length; i++, i %= n);
                                    let inp = inputs[i];
                                    if (cnts[i] == -1)
                                        is[i] = mkIndenter(inp[0], inp[1]);
                                    else if (cnts[i] == inp[2].length)
                                        outs[i] = is[i]();
                                    else
                                        is[i](inp[2][cnts[i]]);
                                    cnts[i]++;
                                });
                                let os = _.zip(seqOuts, outs);
                                return _.every(os, o => propEqual(o[0], o[1]));
                            });
                    });
            });
        property(
            "returns undefined if either argument is not a number",
            jsc.suchthat(arbs.anything, x => !_.isNumber(x) || _.isNaN(x)),
            jsc.suchthat(arbs.anything, x => !_.isUndefined(x) &&
                         (!_.isNumber(x) || _.isNaN(x))),
            jsc.integer(50,80), jsc.nat(20),
            function(nN1, nN2, ls, il) {
                return propEqual(mkIndenter(nN1), undefined) &&
                    propEqual(mkIndenter(nN1,il), undefined) &&
                    propEqual(mkIndenter(ls,nN2), undefined) &&
                    propEqual(mkIndenter(nN1,nN2), undefined);
            });
        property(
            "sample input works",
            "unit",
            function(u) {
                let i = mkIndenter(20);
                i("Short line");
                i("This line is longer than 20 characters");
                i(8);
                i("Big indent");
                i("Not so long line");
                i(-6);
                i("Small indent");
                i(["Item 1", "Item 2", "Really really long Item 3"]);
                return propEqual(i(),
                                 [ 'Short line',
                                   'This line is longer',
                                   'than 20 characters',
                                   '        Big indent',
                                   '        Not so long',
                                   '        line',
                                   '  Small indent',
                                   '  * Item 1',
                                   '  * Item 2',
                                   '  * Really really',
                                   '    long Item 3' ]);
            });
    });

    test("letter_frequency", function() {
        property(
            "Concatenation of strings produces merge of maps",
            jsc.array(arbs.letter), jsc.array(arbs.letter),
            function(arr1, arr2) {
                let compareFrequency = function(_s1, _s2, _s) {
                  let check = true;
                  for (let i in _s) {

                    if (_s[i] != (_s1[i] || 0) + (_s2[i] || 0)) {
                      check = false;
                    }
                  }
                  return check;
                }

                let s1 = arr1.join('');
                let s2 = arr2.join('');

                return compareFrequency(letter_frequency(s1),letter_frequency(s2),letter_frequency(s1+s2));

                // let expected = _.assignWith(letter_frequency(s1),
                //                             letter_frequency(s2),
                //                             _.add);
                // return propEqual(letter_frequency(s1 + s2), expected);
                // return check
            });
        property(
            "Map values are always positive",
            jsc.array(arbs.letter),
            function(arr) {
                let s = arr.join('');
                let r = letter_frequency(s);
                let check = true;
                for(let i in r) {
                  if(Number.isNaN(r[i]) || r[i] < 0) {
                    check = false
                  }
                }
                return check
            });
        property(
            "Hello example works",
            "unit",
            function(u) {
                let a = []; a.H = 1; a.E = 1; a.L = 2; a.O = 1;
                let expected = {'H' : 1,'E' : 1,'L' : 2,'O' : 1}

                let compareFrequency = function(_s, _s1) {
                  let check = true;

                  let count_s = 0;

                  for (let i in _s) {
                    count_s++;
                    if (_s1[i] != (_s[i])) {
                      check = false;
                    }
                  }

                  if (count_s != 4) {
                    check = false;
                  }

                  return check;
                }

                return compareFrequency(letter_frequency('Hello'), expected);

                // debugger
                // try {
                //   propEqual(letter_frequency('Hello'), expected)
                // } catch(e) {
                //   return propEqual(letter_frequency('Hello'),a)
                // }
                //
                // try {
                //   propEqual(letter_frequency('Hello'),a)
                // } catch(e) {
                //   return propEqual(letter_frequency('Hello'), expected)
                // }
                //
                // return false
            });
    });

    test("display_letter_frequency", function() {
        // how to generate frequency table
        let fTable = jsc.array(jsc.tuple([arbs.uLetter, arbs.posInteger])).smap(
            _.fromPairs,
            _.toPairs);

        property(
            "first arguments is not modified",
            fTable,
            function(ft) {
                let copy = _.cloneDeep(ft);
                let dom = {};
                let a = [];
                for(let x in copy) {
                  a[x] = copy[x];
                }
                let before = a.slice();
                display_letter_frequency(a, dom);
                return propEqual(a, before);
            });
        property(
            "Output is a table with right number of rows and 2 columns",
            fTable,
            function(ft) {
                let a = []
                for(let x in ft) {
                  a[x] = ft[x]
                }
                let dom = {};
                display_letter_frequency(a, dom);
                let out = xmlParser.parseFromString(dom.innerHTML, 'text/xml');
                let d = out.documentElement;
                let cs = d.children;
                return propEqual(d.tagName, 'table') &&
                    propEqual(cs.length, _.size(ft)) &&
                    _.every(_.range(cs.length).map(i => {
                        let c = cs.item(i);
                        let subcs = c.children;
                        return propEqual(c.tagName, 'tr') &&
                            propEqual(subcs.length, 2) &&
                            _.every(_.range(subcs.length).map(j => {
                                let subc = subcs.item(j);
                                return propEqual(subc.tagName, 'td') &&
                                    propEqual(subc.children.length, 0);
                            }));
                    }));
            });
        property(
            "Every row has key/value pair from the frequency table",
            fTable,
            function(ft) {
                function isInMap(k,v) {
                    let i = parseInt(v);
                    return propEqual(i + '', v) &&
                        propEqual(ft[k], i);
                }

                let a = []
                for(let x in ft) {
                  a[x] = ft[x]
                }
                let dom = {};
                display_letter_frequency(a, dom);
                let out = xmlParser.parseFromString(dom.innerHTML, 'text/xml');
                let d = out.documentElement;
                let cs = d.children;
                return propEqual(d.tagName, 'table') &&
                    _.every(_.range(cs.length).map(i => {
                        let c = cs.item(i);
                        let subcs = c.children;
                        return propEqual(c.tagName, 'tr') &&
                            propEqual(subcs.length,2) &&
                            propEqual(subcs.item(0).tagName, 'td') &&
                            propEqual(subcs.item(1).tagName, 'td') &&
                            isInMap(subcs.item(0).innerHTML, subcs.item(1).innerHTML);
                    }));
            });
        property(
            "Does nothing if either argument is not an array",
            fTable,
            jsc.dict(arbs.anything),
            jsc.suchthat(arbs.anything, x => !_.isObject(x)),
            jsc.suchthat(arbs.anything, x => !_.isObject(x)),
            jsc.suchthat(arbs.anything, x => !_.isObject(x)),

            function(ft, nO1, nO2, nO3, o) {
                let a = []
                for(let x in ft) {
                  a[x] = ft[x]
                }

                let b = []
                for(let x in nO1) {
                  b[x] = nO1[x]
                }

                let copyO = _.cloneDeep(o);
                let copyNO2 = _.cloneDeep(nO2);
                let copyNO3 = _.cloneDeep(nO3);
                display_letter_frequency(b, copyNO2);
                display_letter_frequency(b, copyO);
                display_letter_frequency(a, copyNO3);
                return propEqual(copyNO2, nO2) &&
                    propEqual(copyO, o) &&
                    propEqual(copyNO3, nO3);
            });
    });
}
