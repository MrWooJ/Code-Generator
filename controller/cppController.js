var fs = require('fs')
const { exec } = require('child_process')

var dir = './tmp'
if (!fs.existsSync(dir)) {
	fs.mkdirSync(dir)
}

var template = '\n' +
	'#include <iostream>' + '\n' +
	'#include <cstdlib>' + '\n' +
	'#include <cmath>' + '\n' + '\n' +
	'using namespace std;' + '\n' + '\n' +
	'int main(void) {' + '\n' + '\n' +
	'@' + 
	'    return 0;' + '\n' +
	'}'

var declaredVariables = []
var declaredTypes = []
var linesOfCodes = []

function injectToTemplate(sentences) {
	var tempTemplate = '' + template
	var ls = ''
	for (var i = 0; i < sentences.length; i++)
		ls += '    ' + sentences[i].toString() + '\n'
	return tempTemplate.replace('@', ls)
}

var compiler = function compileRun(code, cb) {
	var filename = 'output'
	fs.writeFile("./tmp/" + filename + '.cpp', code, function(err) {
		if(err)
			return cb(err)
		exec('g++ ' + "./tmp/" + filename + '.cpp -o ./tmp/a.out', (err, stdout, stdcompileerr) => {
			if (err)
				return cb(err)
			exec('./tmp/a.out', (err, stdout, stdrunerr) => {
				if (err)
					return cb(err)
				var stderr = (stdcompileerr || stdrunerr)
				return cb(null, stderr, stdout)
			})					
		})			
	})
}

function checkVariableExistance(name) {
	for (var i = 0; i < declaredVariables.length; i++) {
		var model = declaredVariables[i]
		if (model.name === name)
			return model
	}
}

function processTranslateLine(lineNodes) {
	var lineTypes = []
	var str = ''
	var operations = ['+', '-', '/', '*', '=']
	var curles = ['(', ')']
	for (var i = 0; i < lineNodes.length; i++) {
		var token = lineNodes[i]
		if (operations.indexOf(token) >= 0)
			str += token + ' '
		else {
			if (isNaN(token)) {
				if (curles.indexOf(token) >= 0)
					str += token + ' '
				else if (declaredVariables.indexOf(token) <= -1) {
					declaredVariables.push(token)
					declaredTypes.push('UNK')
					lineTypes.push('UNK')
					str += 'UNK ' + token + ' '
				}
				else {
					str += token + ' '
					lineTypes.push(declaredTypes[declaredVariables.indexOf(token)])
				}
			}
			else {
				str += token + ' '
				var num = Number(token)
				if (token.includes('.')) {
					lineTypes.push('float')
				}
				else {
					if (num >= 0) {
						if (num < 65535)
							lineTypes.push('unsigned short int')
						else
							lineTypes.push('unsigned long int')
					}	
					else {
						if (num > -32767)
							lineTypes.push('signed short int')
						else
							lineTypes.push('signed long int')
					}
				}
			}
		}
	}
	if (str.includes('UNK')) {
		if (lineTypes.indexOf('float') >= 0) {
			str = str.replace('UNK', 'float')
			var index = declaredTypes.indexOf('UNK')
			declaredTypes[index] = 'float'
		}	
		else if (lineTypes.indexOf('signed long int') >= 0) {
			str = str.replace('UNK', 'signed long int')
			var index = declaredTypes.indexOf('UNK')
			declaredTypes[index] = 'signed long int'
		}
		else if (lineTypes.indexOf('signed short int') >= 0) {
			str = str.replace('UNK', 'signed short int')
			var index = declaredTypes.indexOf('UNK')
			declaredTypes[index] = 'signed short int'
		}
		else if (lineTypes.indexOf('unsigned long int') >= 0) {
			str = str.replace('UNK', 'unsigned long int')
			var index = declaredTypes.indexOf('UNK')
			declaredTypes[index] = 'unsigned long int'
		}
		else if (lineTypes.indexOf('unsigned short int') >= 0) {
			str = str.replace('UNK', 'unsigned short int')
			var index = declaredTypes.indexOf('UNK')
			declaredTypes[index] = 'unsigned short int'
		}
	}
	while(str.includes('UNK'))
		str = str.replace('UNK', '')

	str = str.substring(0, str.length - 1)
	str += ';'
	return str
}

function preparePrintOutSentence(variables) {
	var str = 'cout' + ' << ' + '"[ACTUAL]["'
	for (var i = 0; i < variables.length; i++)
		str += ' << ' + '" ' + variables[i] + ':"' + ' << ' + variables[i]
	return str + ' << ' + '" ]" << endl;'
}

function prepareComment(comment) {
	var str = comment.replace('#', '')
	return 'cout << ' + '"' + str + '" << endl;'
}

function splitMulti(str, tokens) {
	var tempChar = tokens[0]
	for (var i = 1; i < tokens.length; i++)
		str = str.split(tokens[i]).join(tempChar)
	str = str.split(tempChar)
	return str
}

function handleLine(line) {
	var lineFocus = []
	if (line.includes('#'))
		return linesOfCodes.push(prepareComment(line))
	if (/^\s*$/.test(line))
		return linesOfCodes.push(line)
	var trimmedString = line.replace(/\s/g, '')
	if (trimmedString.includes('OUT')) {
		trimmedString = trimmedString.split('(').pop().split(')').shift()
		var outVariables = trimmedString.split(",")
		if (outVariables.length > 0)
			linesOfCodes.push(preparePrintOutSentence(outVariables))
		else
			linesOfCodes.push(preparePrintOutSentence(declaredVariables))
	}
	else {
		var operations = ['+', '-', '/', '*', '=']
		var current = ''
		var prevcurrent = ''
		var prevprevcurrent = ''
		for (var i = 0; i < trimmedString.length; i++) {
			var character = trimmedString.charAt(i)
			if (character === '(' || character === ')') {
				if (current)
					lineFocus.push(current)
				current = ''
				lineFocus.push(character)
				continue
			}
			if (i > 0)
				prevcurrent = trimmedString.charAt(i - 1)
			if (operations.indexOf(character) < 0)
				current += character
			else {
				if (operations.indexOf(prevcurrent) >= 0)
					current += character
				else {
					if (current)
						lineFocus.push(current)
					current = ''
					lineFocus.push(character)
					prevcurrent = character	
				}
			}
		}
		if (current !== '')
			lineFocus.push(current)
		linesOfCodes.push((processTranslateLine(lineFocus)))
	}
}

function handleSnippet(snippet) {
	var linesArray = []
	var lines = snippet.split('\n')
	for (var i = 0; i < lines.length; i++)
		linesArray.push(lines[i])
	return linesArray
}

var starter = function startEngine(text) {
	declaredVariables = []
	declaredTypes = []
	linesOfCodes = []
	var linesOfInput = handleSnippet(text)
	for (var i = 0; i < linesOfInput.length; i++)
		handleLine(linesOfInput[i])
	return injectToTemplate(linesOfCodes)
}

module.exports = {
	starter: starter,
	compiler: compiler	
}