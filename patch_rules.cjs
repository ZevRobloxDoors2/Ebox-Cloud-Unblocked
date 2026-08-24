const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

const oldFunc = `    function isValidMessage(data) {
      return data.keys().hasAll(['senderId', 'text', 'createdAt'])
        && data.senderId is string && data.senderId == request.auth.uid
        && data.text is string && data.text.size() > 0 && data.text.size() <= 1000
        && data.createdAt is timestamp;
    }`;

const newFunc = `    function isValidMessage(data) {
      return data.keys().hasAll(['senderId', 'text', 'createdAt'])
        && data.senderId is string && data.senderId == request.auth.uid
        && data.text is string && data.text.size() <= 1000
        && (data.text.size() > 0 || data.keys().hasAny(['imageUrl']))
        && (data.keys().hasAny(['imageUrl']) ? data.imageUrl is string && data.imageUrl.size() < 1048576 : true)
        && data.createdAt is timestamp;
    }`;

content = content.replace(oldFunc, newFunc);
fs.writeFileSync('firestore.rules', content);
