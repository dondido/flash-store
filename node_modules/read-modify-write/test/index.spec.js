const fs = require('fs');
const path = require('path');
const assert = require('assert').strict;
const rmw = require('../index');
const move = url => url.replace('test', 'dist');
const src = 'test/dummy';
const code = 'const a = [];';
const html = '<html lang="en"><head><meta charset="utf-8"><script src="script.js"></script></head></html>';
const clearFiles = () => {
    const removeFile = filePath => fs.unlinkSync(path.join(__dirname, '../', 'dist/dummy', filePath));
    const folder = path.join(__dirname, '../', 'dist/dummy');
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach(removeFile);
    }
};

test('Should properly read files', () => {
    const compareContent = (c, i) => Object.values(rmw(src))[i].content === c;
    assert.ok([html, code].every(compareContent));
});

test('Should properly apply filter', () => {
    const filter = c => c.endsWith('.js');
    assert.ok(/^.*.js$/.test(Object.keys(rmw(src, null, filter))[0]));
});

test('Should properly modify file content', () => {
    const filterHtml = c => c.endsWith('.html');
    const modify = c => c.replace('<script src="script.js"></script>', `<script>${code}</script`);
    assert.equal(Object.values(rmw(src, null, filterHtml, modify))[0].content, modify(html));
});

test('Should properly async modify file content', () => {
    const filterHtml = c => c.endsWith('.html');
    const updateContent = c => c.replace('<script src="script.js"></script>', `<script>${code}</script`);
    const modify = c => Promise.resolve(updateContent(c));
    const result = rmw(src, null, filterHtml, modify);
    Object.values(result)[0].content.then(content => assert.equal(content, updateContent(html)));
});

test('Should properly copy files to destination folder', () => {
    clearFiles();
    rmw(src, move);
    assert.equal(fs.readdirSync(path.join(__dirname, '../', 'dist/dummy')).join(), 'index.html,script.js');
});

test('Should properly write files and add suffix', () => {
    clearFiles();
    const filter = c => c.endsWith('.js');
    const suffix = url => url.replace('test', 'dist').replace('.js', '.min.js');
    rmw(src, suffix, filter);
    assert.equal(fs.readdirSync(path.join(__dirname, '../', 'dist/dummy')).join(), 'script.min.js'); 
}); 