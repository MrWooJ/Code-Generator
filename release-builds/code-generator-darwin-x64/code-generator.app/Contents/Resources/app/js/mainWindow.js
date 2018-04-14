$(document).ready(function () {

	//fix dynamic sizes

	$("#TranslateButton").prop('disabled', true)
	$("#ExportButton").prop('disabled', true)
	$("#CompileRunButton").prop('disabled', true)

	function sendAlertEvent(title, message) {
		var data = {
			title: title,
			message: message
		}
		ipcRenderer.send('alert', data)
	}

	const electron = require('electron')
	const {ipcRenderer} = electron

	$('#inputSnippetInputTextarea').bind('input propertychange', function() {
		if ($("#inputSnippetInputTextarea").val()) {
			$("#TranslateButton").prop('disabled', false)
		}
		else {
			$("#TranslateButton").prop('disabled', true)
		}
	})

	$('#codeSnippetOutputTextarea').bind('input propertychange', function() {
		if ($("#codeSnippetOutputTextarea").val()) {
			$("#ExportButton").prop('disabled', false)
			$("#CompileRunButton").prop('disabled', false)
		}
		else {
			$("#ExportButton").prop('disabled', true)
			$("#CompileRunButton").prop('disabled', true)
		}
	})

	ipcRenderer.on('STDOUT', function(e, text)	{
		$('.page-loader-wrapper').fadeOut()
		$("#STDOUTTextarea").val(text)
	})

	ipcRenderer.on('STDERR', function(e, text)	{
		$('.page-loader-wrapper').fadeOut()
		$("#STDERRTextarea").val(text)
	})

	ipcRenderer.on('TranslatedCode', function(e, text)	{
		$("#codeSnippetOutputTextarea").val(text)
		$("#ExportButton").prop('disabled', false)
		$("#CompileRunButton").prop('disabled', false)
	})

	ipcRenderer.on('Reset', function()	{
		$('#ResetButton').click()
	})

	ipcRenderer.on('Default', function()	{
		$('#DefaultInputButton').click()
	})

	ipcRenderer.on('Translate', function()	{
		if (!$("#inputSnippetInputTextarea").val())
			return sendAlertEvent('Input is Required', 'In order to translate the input snippet, It is neccessary to enter the mathematical equations.')
		else
			$('#TranslateButton').click()
	})

	ipcRenderer.on('Export', function()	{
		if (!$("#codeSnippetOutputTextarea").val())
			return sendAlertEvent('Code is Required', 'In order to export the translated code, It is neccessary to enter the mathematical equations first and then click translate button.')
		else
			$('#ExportButton').click()
	})

	ipcRenderer.on('CompileRun', function()	{
		if (!$("#codeSnippetOutputTextarea").val())
			return sendAlertEvent('Code is Required', 'In order to compile and run the translated code, It is neccessary to enter the mathematical equations first and then click translate button.')
		else
			$('#CompileRunButton').click()
	})

	$("#DefaultInputButton").click(function (e) {
		e.preventDefault()
		var defaultData = '' +
			'#Simple Math Operations' + '\n' +
			'A=2' + '\n' +
			'B=3.4' + '\n' + 
			'C=A+B' + '\n' +
			'#[EXPECT][ A:2 B:3.4 C:5.4 ]' + '\n' +
			'OUT(A,B,C)' + '\n' + '\n' + 
			'#Simple Math Operations with Reinitialization' + '\n' +
			'A=2' + '\n' +
			'B=3.4' + '\n' + 
			'A=5' + '\n' +
			'C=A+B' + '\n' +
			'#[EXPECT][ A:5 B:3.4 C:8.4 ]' + '\n' +
			'OUT(A,B,C)' + '\n' + '\n' + 
			'#Simple Math Operations with Reinitialization and Effect of Variable Type' + '\n' +
			'A=2' + '\n' +
			'B=3.4' + '\n' + 
			'A=5.5' + '\n' +
			'C=A+B' + '\n' + 
			'#[EXPECT][ A:5 B:3.4 C:8.4 ]' + '\n' +
			'OUT(A,B,C)' + '\n' + '\n' + 
			'#Simple Math Operations with Whitespaces' + '\n' +
			'E = 2' + '\n' +
			'F =   3.4' + '\n' + 
			'G = E + F' + '\n' +
			'#[EXPECT][ E:2 F:3.4 G:5.4 ]' + '\n' +
			'OUT(E, F, G)' + '\n' + '\n' + 
			'#Advance Math Operations' + '\n' +
			'H=2' + '\n' +
			'I=4.3' + '\n' + 
			'J=3' + '\n' + 
			'K=H*I/J' + '\n' + 
			'#[EXPECT][ H:2 I:4.3 J:3, K:2.86 ]' + '\n' +
			'OUT(H, I, J, K)' + '\n' + '\n' + 
			'#Advance Math Operations with Curly Braces' + '\n' +
			'O=2' + '\n' +
			'P=4.5' + '\n' + 
			'Q=3' + '\n' +
			'R=7' + '\n' +
			'S=2' + '\n' +
			'T=(O*P/Q)+R-S' + '\n' +
			'#[EXPECT][ O:2 P:4.5 Q:3 R:7 S:2 T:8 ]' + '\n' +
			'OUT(O, P, Q, R, S, T)' + '\n' + '\n' + 
			'#Advance Math Operations with Nested Curly Braces' + '\n' +
			'T=(((O-P)/Q)+R)*S' + '\n' +
			'#[EXPECT][ O:2 P:4.5 Q:3 R:7 S:2 T:12.3 ]' + '\n' +
			'OUT(O, P, Q, R, S, T)' + '\n' + '\n' + 
			'#Advance Math Operations with Curly Braces and Negative Numbers' + '\n' +
			'U=-2' + '\n' +
			'V=4.5' + '\n' + 
			'W=-3' + '\n' +
			'X=-7' + '\n' +
			'Y=2' + '\n' + 
			'Z=(U*V/W)+X-Y' + '\n' +
			'#[EXPECT][ U:-2 V:4.5 W:-3 X:-7 Y:2 T:-6 ]' + '\n' +
			'OUT(U, V, W, X, Y, Z)' + '\n'
		$("#inputSnippetInputTextarea").val(defaultData)
		$("#TranslateButton").prop('disabled', false)
	})

	$("#ResetButton").click(function (e) {
		e.preventDefault()
		$("#inputSnippetInputTextarea").val('')
		$("#codeSnippetOutputTextarea").val('')
		$("#STDOUTTextarea").val('')
		$("#STDERRTextarea").val('')
		$("#TranslateButton").prop('disabled', true)
		$("#ExportButton").prop('disabled', true)
		$("#CompileRunButton").prop('disabled', true)
	})

	$("#ImportButton").click(function (e) {
		e.preventDefault()
		if ('FileReader' in window) {
			$('#exampleInputFile').click()
		}
		else {
			return sendAlertEvent('Oops!', 'Your browser does not support the HTML5 FileReader.')
  	}
	})

	$("#exampleInputFile").change(function (event) {
		var fileToLoad = event.target.files[0]
		if (fileToLoad) {
			var reader = new FileReader()
			reader.onload = function(fileLoadedEvent) {
				if (fileToLoad.type === 'text/plain') {
					var textFromFileLoaded = fileLoadedEvent.target.result
					$("#inputSnippetInputTextarea").val(textFromFileLoaded)
					$("#TranslateButton").prop('disabled', false)	
				}
				else
					return sendAlertEvent('File Validation Failed', 'In order to enter the input snippet from file, The file type should be text/plian (.txt).')
			}
			reader.readAsText(fileToLoad, 'UTF-8')
		}
	})

	$("#ClearInputButton").click(function (e) {
		e.preventDefault()
		$("#inputSnippetInputTextarea").val('')
		$("#TranslateButton").prop('disabled', true)
	})

	$("#TranslateButton").click(function (e) {
		e.preventDefault()
		var text = $("#inputSnippetInputTextarea").val()
		if (text)
			ipcRenderer.send('inputSnippet', text)
		else
			return sendAlertEvent('Input is Required', 'In order to translate the input snippet, It is neccessary to enter the mathematical equations.')
	})

	$("#ExportButton").click(function (e) {
		e.preventDefault()
		var textToWrite = ''
		var text = $('#codeSnippetOutputTextarea').val()
		if (text)
			textToWrite = $('#codeSnippetOutputTextarea').val()
		else
			return sendAlertEvent('Code is Required', 'In order to compile and run the translated code, It is neccessary to enter the mathematical equations first and then click translate button.')
		if ('Blob' in window) {
			var fileName = 'output.cpp'
			if (fileName) {
				var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' })
	
				if ('msSaveOrOpenBlob' in navigator) {
					navigator.msSaveOrOpenBlob(textFileAsBlob, fileName)
				}
				else {
					var downloadLink = document.createElement('a')
					downloadLink.download = fileName
					downloadLink.innerHTML = 'Download File'
			
					if ('webkitURL' in window) {
						downloadLink.href = window.URL.createObjectURL(textFileAsBlob)
					}
					else {
						downloadLink.href = window.URL.createObjectURL(textFileAsBlob)
						downloadLink.click(function() {
							document.body.removeChild(event.target)
						})
						downloadLink.style.display = 'none'
						document.body.appendChild(downloadLink)
					}
					downloadLink.click()
				}
			}
		}
		else {
			return sendAlertEvent('Oops!', 'Your browser does not support the HTML5 Blob.')
		}
	})

	$("#CompileRunButton").click(function (e) {
		e.preventDefault()
		$('.page-loader-wrapper').fadeIn()
		var text = $("#codeSnippetOutputTextarea").val()
		if (text)
			ipcRenderer.send('codeSnippet', text)
		else
			return sendAlertEvent('Code is Required', 'In order to compile and run the translated code, It is neccessary to enter the mathematical equations first and then click translate button.')
	})

})