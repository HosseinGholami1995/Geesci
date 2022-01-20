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
		
		if ( output_folder != null ) {
			for ( var i = 0; i < o.formats.length; i++ ) {
				
				var file = new File(output_folder + '/' + dialog_filename);
				var save_options = save[ o.app ][ o.formats[i] ]();
				
				if ( save_options.exportFile ) {
					doc.exportFile( file, save_options.type, save_options.options );
				}
				else {
					var lowercase = (o.app === 'ps' ? Extension.LOWERCASE : false);
					doc.saveAs( file, save_options, true, lowercase );
				}
				
			}
		}
		
	},
	ai: {
		ai: function() {
			
			var ai_options = new IllustratorSaveOptions();
			// ai_options.flattenOutput = OutputFlattening.PRESERVEAPPEARANCE;
			return ai_options;
			
		},
		pdf: function() {
			
			var pdf_Options = new PDFSaveOptions();
			pdf_Options.pDFPreset = checkPresets( false, pdfPresetAI );
			return pdf_Options;
			
		},
		eps: function() {
			
			var eps_Opts = new EPSSaveOptions();
			eps_Opts.saveMultipleArtboards = false;
			eps_Opts.artBoardRange = ''; // All 
			eps_Opts.cmykPostScript = true;
			// eps_Opts.compatibility = Compatibility.ILLUSTRATOR17; // 8-17 or JAPANESEVERSION3
			eps_Opts.embedAllFonts = true;
			eps_Opts.embedLinkedFiles = true;
			eps_Opts.flattenOutput = OutputFlattening.PRESERVEAPPEARANCE; // PRESERVEPATHS, PRESERVEAPPEARANCE
			eps_Opts.includeDocumentThumbnails = true;
			eps_Opts.overprint = PDFOverprint.PRESERVEPDFOVERPRINT; // DISCARDPDFOVERPRINT, PRESERVEPDFOVERPRINT
			eps_Opts.postScript = EPSPostScriptLevelEnum.LEVEL2; // 2 or 3
			eps_Opts.preview = EPSPreview.TRANSPARENTCOLORTIFF; // BWTIFF, COLORTIFF, TRANSPARENTCOLORTIFF, NONE
			
			return eps_Opts;
			
		},
		jpeg: function() {
			return save.ai.jpg();
		},
		jpg: function() {
	
			var jpg_Options = new ExportOptionsJPEG();
			var type = ExportType.JPEG;
			jpg_Options.antialiasing = true;
			jpg_Options.matter = true;
			jpg_Options.artBoardClipping = false; // true = restricts the graphics to the active artboard || false = outputs errthing ignoring the artboard(s)
			// jpg_Options.blurAmount = 0.0; // max 2.0
			// jpg_Options.horizontalScale = 200.0; // default 100.0
			// jpg_Options.verticalScale = 200.0; // default 100.0
				var matteRGB = new RGBColor();
				matteRGB.red = 255;
				matteRGB.green = 255;
				matteRGB.blue = 255;
			// jpg_Options.matteColor = matteRGB;
			jpg_Options.optimization = true; // web optimization - default true;
			jpg_Options.qualitySetting = 100; // 0-100 — default 30
			// jpg_Options.saveAsHTML = true; // default false
			return { 
				exportFile: true,
				type: ExportType.JPEG,
				options: jpg_Options, 
			};;
			
		},
		png8: function() {
			
			var png8_Opts = new ExportOptionsPNG8();
			png8_Opts.antialiasing = true;
			png8_Opts.artBoardClipping = false;
			png8_Opts.colorCount = 256; // 0-256
			png8_Opts.colorDitherMethod = ColorDitherMethod.DIFFUSION; // DIFFUSION, NOREDUCTION, NOISE, PATTERNDITHER
			png8_Opts.colorReductionMethod = ColorReductionMethod.SELECTIVE; // ADAPTIVE, SELECTIVE, PERCEPTUAL, WEB
			png8_Opts.interlaced = false;
			png8_Opts.matte = true;
				var matteColor = new RGBColor();
				matteColor.red = 255;
				matteColor.green = 255;
				matteColor.blue = 255;
			png8_Opts.matteColor = matteColor;
			png8_Opts.transparency = true;
				var scale = 100;
			png8_Opts.horizontalScale = scale;
			png8_Opts.verticalScale = scale;
			png8_Opts.saveAsHTML = false;
			
			return { 
				exportFile: true,
				type: ExportType.PNG8,
				options: png8_Opts, 
			};
			
		},
		png: function() {
			return save.ai.png24();
		},
		png24: function() {
			
			var png24_Opts = new ExportOptionsPNG24();
			png24_Opts.antialiasing = true;
			png24_Opts.artBoardClipping = false;
			png24_Opts.matte = true;
				var matteColor = new RGBColor();
				matteColor.red = 255;
				matteColor.green = 255;
				matteColor.blue = 255;
			png24_Opts.matteColor = matteColor;
			png24_Opts.transparency = true;
				var scale = 100;
			png24_Opts.horizontalScale = scale;
			png24_Opts.verticalScale = scale;
			png24_Opts.saveAsHTML = false;
			
			return { 
				exportFile: true,
				type: ExportType.PNG24,
				options: png24_Opts, 
			};
			
		},
		svg: function() {
			
			var svg_Opts = new ExportOptionsSVG();
			svg_Opts.saveMultipleArtboards = false;
			svg_Opts.artBoardRange = ''; // All 
			svg_Opts.embedRasterImages = true;
			svg_Opts.embedAllFonts = true;
			svg_Opts.coordinatePrecision = 3; // 1-7 
			svg_Opts.cssProperties = SVGCSSPropertyLocation.STYLEATTRIBUTES;  // ENTITIES, STYLEATTRIBUTES, PRESENTATIONATTRIBUTES, STYLEELEMENTS
			svg_Opts.documentEncoding = SVGDocumentEncoding.UTF8; // ASCII, UTF8, UTF16
			svg_Opts.DTD = SVGDTDVersion.SVG1_1; // SVG1_0, SVG1_1, SVGBASIC1_1, SVGTINY1_1, SVGTINY1_1PLUS, SVGTINY1_2
			
			return { 
				exportFile: true,
				type: ExportType.SVG,
				options: svg_Opts, 
			};
			
		},
	},
	ps: {
		psd: function() {
			
			var psd_Options = new PhotoshopSaveOptions();
			
			
			
			return psd_Options;
			
		},
		jpeg: function() {
			return save.ps.jpg();
		},
		jpg: function() {
			
			var jpg_Options = new JPEGSaveOptions();
			jpg_Options.embedColorProfile = true;
			jpg_Options.FormatOptions = FormatOptions.OPTIMIZEDBASELINE; // OPTIMIZEDBASELINE, PROGRESSIVE, STANDARDBASELINE
			// jpg_Options.scans = 5; // For FormatOptions.PROGRESSIVE
			jpg_Options.matte = MatteType.WHITE; // BACKGROUND, BLACK, FOREGROUND, NETSCAPE, NONE, SEMIGRAY, WHITE
			jpg_Options.quality = 12; // 0-12
			return jpg_Options;
			
		},
		psd: function() {
			
			var psd_saveOpts = new PhotoshopSaveOptions();
			
			psd_saveOpts.layers            = true;
			psd_saveOpts.embedColorProfile = true;
			psd_saveOpts.annotations       = true;
			psd_saveOpts.alphaChannels     = true;
			
			return psd_saveOpts;
			
		},
		pdf: function() {
			
			var pdf_SaveOpts = new PDFSaveOptions();
			
			pdf_SaveOpts.jpegQuality = 12;
			pdf_SaveOpts.optimizeForWeb = false;
			
			return pdf_SaveOpts;
			
		},
		png: function() {
			
			var png_SaveOpts = new PNGSaveOptions();
			
			png_SaveOpts.compression = 9;
			png_SaveOpts.interlaced = false;
			
			return png_SaveOpts;
			
		},
		tif: function() {
			return save.ps.tiff();
		},
		tiff: function() {
			
			var tiff_SaveOpts = new TiffSaveOptions();
			
			tiff_SaveOpts.alphaChannels      = true;
			tiff_SaveOpts.annotations        = true;
			tiff_SaveOpts.imageCompression   = TIFFEncoding.JPEG;
			tiff_SaveOpts.interleaveChannels = true;
			tiff_SaveOpts.jpegQuality        = 12;
			tiff_SaveOpts.layers             = true;
			tiff_SaveOpts.layerCompression   = LayerCompression.ZIP;
			tiff_SaveOpts.transparency       = true;
			
			return tiff_SaveOpts;
			
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