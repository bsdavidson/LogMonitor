var array = [1, 2, 3, 4, 5];

var sum = function(array) {
  console.log(array);
  if (array.length === 0) { return 0; }

  return array[0] + sum(array.slice(1));

};

var sum = function(array, indent) {
  if (!indent) {
    indent = '';
  }
  console.log(indent, array);
  if (array.length === 0) {
    console.log(indent, 'returning 0');
    return 0;
  }
  var a = array[0];
  var b = sum(array.slice(1), indent + ' ');
  console.log(indent, 'a', a);
  console.log(indent, 'b', b);

  var result = a + b;
  console.log(indent, 'result', result);

  return result;
};


var add = function(a, b) {
  if (b) {
    return a + b;
  } else {
    return function (x) {
      return a + x;
    };
  }
};


var total = sum(array);

console.log(total);


var isPal = function(s) {
  var l, r;
  l = s.replace(/[^A-Z0-9]/ig, "").toLowerCase();
  r = l.split('').reverse().join('');
  return (l === r);
};
