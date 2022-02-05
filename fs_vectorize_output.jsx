
//for run this code first you should have photoshop.version > cc18
//you should import file *****.asl 
//for debug in vscode simply ,1)install Adobe Script Runner , 2)ExtenedScript Debuger 
var input_path =Folder.selectDialog("koja bekhoonam")

main(input_path);

function geeform(main_file,input_path){
    app.activeDocument.selection.selectAll();
    app.activeDocument.selection.copy();
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    app.open(main_file);
    app.activeDocument.paste();
    quickSel(1,1,30);
    app.activeDocument.selection.invert();
    app.activeDocument.selection.makeWorkPath(15);
    PathtoVectorMask();

    app.activeDocument.pathItems[0].remove();

    var pdf_SaveOpts = new PDFSaveOptions();
    pdf_SaveOpts.alphaChannels=true;
    pdf_SaveOpts.annotations=false;
    pdf_SaveOpts.colorConversion=false;
    pdf_SaveOpts.embedColorProfile=true;
    pdf_SaveOpts.embedThumbnail=false;
    pdf_SaveOpts.encoding=PDFEncoding.NONE;
    pdf_SaveOpts.layers=false;
    pdf_SaveOpts.optimizeForWeb = false;
    pdf_SaveOpts.PDFCompatibility=PDFCompatibility.PDF13;
    pdf_SaveOpts.PDFStandard=PDFStandard.PDFX1A2003;
    pdf_SaveOpts.jpegQuality = 12;
    pdf_SaveOpts.transparency=true;
    // pdf_SaveOpts.useOutlines=true;
    // pdf_SaveOpts.vectorData=true;
    

    var file = new File(input_path + '/' + get_name(main_file.name) );

    app.activeDocument.saveAs(file,pdf_SaveOpts,true,Extension.NONE);


    asasasads
}

function main(input_path) {   
    //configuration Editing:
    app.preferences.rulerUnits=Units.PIXELS;
    app.preferences.typeUnits=TypeUnits.PIXELS;
    //=============Start=========================
    close_all();
    //===========open the png prepare Folder ====
    var png_Folder = new Folder (input_path);
    var png_files=png_Folder.getFiles();

    for (var i=0 ; i<png_files.length; i++) {
        if (is_chap(png_files[i].name)){
            var file_name=get_name(png_files[i].name)
            alert(file_name);
            //opencut_file            
            var cut_file = get_cut_file(file_name,png_files);
            alert(cut_file.name);
            if (cut_file){
                alert("open cut file");
                app.open(cut_file);
                geeform(png_files[i],input_path);
                app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            }else{
                alert("this file has no cutfile or cut file has wrong name");
            }
        }
    }
    alert("Finish");
}

function get_cut_file(input_file_name,all_file){
    for (var i=0 ; i<all_file.length; i++) {
        file_name=all_file[i].name;
        if(file_name==(input_file_name+"-c.png")){
            return all_file[i];
        }
    }
    return false
}
function get_name(String){
    return String.split(".png")[0];   
}
function is_chap(String){
    var file_name=get_name(String);
    var is_it_cut = file_name.slice(file_name.length-2,file_name.length)
    if (is_it_cut !="-c")
        return true
    else
        return false
}
///_________________________________________________________________________________________________
// Here are the function 
//__________________________________________________________________________________________________
function close_all() {
    while (app.documents.length!=0) {
        app.activeDocument.close()
    }     
}

function sTID(s) { return stringIDToTypeID(s); };
function cTID(s) { return charIDToTypeID(s); };
function PathtoVectorMask()
{
    var desc11 = new ActionDescriptor();
    var ref8 = new ActionReference();
    ref8.putClass( cTID("Path") );
    desc11.putReference( cTID("null"), ref8);
    var ref9 = new ActionReference();
    ref9.putEnumerated(cTID("Path"), cTID("Path"), sTID("vectorMask"));
    desc11.putReference(cTID("At  "), ref9);
    var ref10 = new ActionReference();
    ref10.putEnumerated(cTID("Path"), cTID("Ordn"), cTID("Trgt"));
    desc11.putReference(cTID("Usng"), ref10);
    executeAction(cTID("Mk  "), desc11, DialogModes.NO );
}

function quickSel (x, y, tol){
    var idsetd = charIDToTypeID( "setd" );
        var desc2 = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
            var ref1 = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idfsel = charIDToTypeID( "fsel" );
            ref1.putProperty( idChnl, idfsel );
        desc2.putReference( idnull, ref1 );
        var idT = charIDToTypeID( "T   " );
            var desc3 = new ActionDescriptor();
            var idHrzn = charIDToTypeID( "Hrzn" );
            var idPxl = charIDToTypeID( "#Pxl" );
            desc3.putUnitDouble( idHrzn, idPxl, x );
            var idVrtc = charIDToTypeID( "Vrtc" );
            var idPxl = charIDToTypeID( "#Pxl" );
            desc3.putUnitDouble( idVrtc, idPxl, y);
        var idPnt = charIDToTypeID( "Pnt " );
        desc2.putObject( idT, idPnt, desc3 );
        var idTlrn = charIDToTypeID( "Tlrn" );
        desc2.putInteger( idTlrn, tol);
        var idAntA = charIDToTypeID( "AntA" );
        desc2.putBoolean( idAntA, true );
        var idCntg = charIDToTypeID( "Cntg" );
        desc2.putBoolean( idCntg, true );
    executeAction( idsetd, desc2, DialogModes.NO );
};
