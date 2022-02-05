// https://gist.github.com/joonaspaakko/b878d993b038b98b8ca78cc859916af4

// The idea is that it exports the work file and the production file (or a preview file) at the same time saving some time and effort.

// - This has been tested in Photoshop CC and Illustrator CC. It used to work in CS3, but I'm fairly sure I've changed the code enough at this point to break it for older versions.
// - Has a simple dialog where you can rename the file or leave it as it is.
// - If document has been saved, the script will suggest saving in the same path, otherwise it will default to what's set in the variable "newDocPath".
// - Photoshop saves .jpg and .psd
// - Illustrator saves .pdf and .ai and there's now the additional jpg option

// ***** SaveTo.jsx Version 1.3. *****

/*
	
	Changelog:
	
	v.1.3.
		- Added more output formats for both applications
		
	v.1.2. 
		- Added jpeg export for AI. 
			- Just add 'jpg' in the o.format array.
			- artBoardClipping is set to false, which makes it so that all objects gets exported while ignoring artboards. Set that to true and only the active artboard gets exported.
	
	v.1.1.
		- Fixed a weird issue where saving as jpg causes weird dialog stuff to happen if it's not saved as a copy. This started happening somewhere between PS CC 2017 and PS CC 2018.
		- Variable "pdfPresetAI" now has a failsafe where if the set profile doesn't exist, the first found profile is used instead. So what ever happens the pdf will be saved, but it might be using a wrong profile, but don't worry, the script will tell you if this happened and gives the name of the profile that was used. This failsafe would still fail if someone doesn't have any presets at all, but if that ever happens, he had it coming...
		- Added a new variable "listOfPresetsAI" so that you can easily get a list of presets so you can copy and paste the preset name to "pdfPresetAI";
	
*/

var newDocPath = "~/Desktop/";
var dialogOffsetX = 250; // Subtracts from the center of the screen = Center of the screen horizontally - 250px.
var dialogOffsetY = 200; // Just a static value = 200px from the top of the screen.

var o = {};
var appName = app.name;
var pdfPresetNoMatch = false;

// IF PHOTOSHOP
if ( appName === "Adobe Photoshop" ) {
	o.app = 'ps';
	// o.formats = ['pdf','tif','png','jpg','psd']; // pdf, tif, png, jpg, psd
	o.formats = ['pdf']; // pdf, tif, png, jpg, psd
	o.dialogTitle = "Save As: " + o.formats.join(', ');
}
// IF ILLUSTRATOR
else if ( appName === "Adobe Illustrator" ) {
	o.app = 'ai';
	// o.formats = ['jpg', 'png8', 'png24', 'svg', 'eps', 'pdf', 'ai']; // jpg, png8, png24, svg, eps, pdf, ai
	o.formats = ['pdf', 'ai']; // jpg, png8, png24, svg, eps, pdf, ai
	o.dialogTitle = "Save As: " + o.formats.join(', ');
	var listOfPresetsAI = false; // When set to true the script won't save anything but instead gives you a list of pdf preset names.
	var pdfPresetAI = "Charles";
}

function dialog() {
		
	// Dialog
	var dlg = new Window("dialog");
	dlg.text = o.dialogTitle;
	
	var panel = dlg.add('panel');
	panel.alignChildren = ['left','center'];
	panel.orientation = 'row';
	
	var text1 = panel.add('statictext');
	text1.text = 'Filename: ';
	
	var text2 = panel.add('editText');
	text2.text = app.activeDocument.name.split('.')[0];
	text2.preferredSize = [530,23];
	text2.active = true;
	
	var button1 = panel.add('button', undefined, undefined, { name: 'cancel'});
	button1.text = "Cancel";
	
	var button2 = panel.add('button', undefined, undefined, { name: 'ok'});
	button2.text = "Save...";
	
	button2.onClick = function ( e ) {
		save.init( dlg, text2.text );
	};
	
	dlg.onShow = function () {
		dlg.location.x = dlg.location.x - dialogOffsetX;
		dlg.location.y = dialogOffsetY;
	}
	
	dlg.show();
	
}

var save = {
	init: function( dlg, dialog_filename ) {
		
		dlg.close();
		
		var doc = app.activeDocument;
		
		var doc_path;
		try {
			doc_path = doc.path.toString();
		} catch(e) {
			doc_path = newDocPath;
		}
		
		var output_folder = Folder.selectDialog( 'Output folder', doc_path === "" ? newDocPath : doc_path );
		
        for ( var i = 0; i < o.formats.length; i++ ) {
            
            var file = new File(output_folder + '/' + dialog_filename);
            var save_options = save[ o.app ][ o.formats[i] ]();
            
            if ( save_options.exportFile ) {
                doc.exportFile( file, save_options.type, save_options.options );
            }
            else {
                var lowercase = (o.app === 'ps' ? Extension.LOWERCASE : false);
                doc.saveAs( file, save_options, true, Extension.NONE);
            }
            
        }
		
	},
	ai: {
	},
	ps: {
		pdf: function() {
			
			var pdf_SaveOpts = new PDFSaveOptions();
			
			pdf_SaveOpts.jpegQuality = 12;
			pdf_SaveOpts.optimizeForWeb = false;
			
			return pdf_SaveOpts;
			
		},
	}
};

function checkPresets( list, testPreset ) {
	
	var pdfPresets = app.PDFPresetsList;
	
	if ( list === true ) {
		alert( "\n" + pdfPresets.join('\n') );
	}
	else {
		var preset = null;
		for ( var i = pdfPresets.length; i--; ) {
			if ( pdfPresets[i] === testPreset ) {
				preset = testPreset;
			}
		}
		pdfPresetNoMatch = (preset === null);
		return (pdfPresetNoMatch ? pdfPresets[0] : preset);
	}
	
}

if ( listOfPresetsAI === true ) {
	checkPresets( true );
}
else if ( app.documents.length > 0 ) {
	
	dialog();
	if ( pdfPresetNoMatch ) alert( "Couldn't use your PDF preset!!! \n Used " + app.PDFPresetsList[0] + " instead." );
	
}