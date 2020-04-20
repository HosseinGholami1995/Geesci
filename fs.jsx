//for run this code first you should have photoshop.version > cc18
//you should import file *****.asl 

//for debug in vscode simply ,1)install Adobe Script Runner , 2)ExtenedScript Debuger 
var message= "1) Game 2)Pezeshki 3)Tarah ------3)omomi  4)green, under compeletment ! "

var value="Tarah"
var Cnf =confirm("do U whant prepare size ?  \r\r else make moc,cut,chap ");

if (Cnf==false){
    value = prompt("type the kind of mockup which you whant to creat \r at this time we have \r"+message)}

main(value,Cnf);

function Geesci(cnf) {

    if(cnf){
        unlockLayer();
        make_same_size();
    }
    else{
        make_chap();
        make_cut();
        make_mockup();
    }
}


function make_same_size() {
    var Name_x = app.activeDocument.name.split(".")[0];

    var x=app.activeDocument.width.value;
    var y=app.activeDocument.height.value;
    var z=0;

    if(x>y){
        z=x;}
    if(x<y){
        z=y;}
    
    if(x!=y){

        app.activeDocument.resizeCanvas(z,z,AnchorPosition.MIDDLECENTER);
    }
    
    app.activeDocument.resizeImage(1200,1200,600,ResampleMethod.AUTOMATIC,0);

    
    app.activeDocument.artLayers[0].resize(99,99,AnchorPosition.MIDDLECENTER);


    save_png_chap(Name_x);
    

}


function Select_moc(Seleceted_moc) {
    try {
        app.activeDocument.layerSets[0].artLayers.getByName("Colored Background").applyStyle(Seleceted_moc);   
    } catch (error) {
        
    }
}

function make_chap() {
    var Name_chap = app.activeDocument.name.split(".")[0];
    app.activeDocument.artLayers[0].applyStyle("30px str");
    app.activeDocument.artLayers[0].rasterize(RasterizeType.ENTIRELAYER)
    save_png_chap(Name_chap);
    //back to normal
    var x=app.activeDocument.historyStates.length
    var sateref=app.activeDocument.historyStates[x-3];
    app.activeDocument.activeHistoryState=sateref;

}

function make_cut(){
    var Name_cut = app.activeDocument.name.split(".")[0];
    quickSel(0,0,30);
    app.activeDocument.selection.smooth(10);
    app.activeDocument.selection.clear();
    app.activeDocument.selection.deselect();
    app.activeDocument.artLayers[0].applyStyle("cut");
    app.activeDocument.artLayers[0].rasterize(RasterizeType.ENTIRELAYER);
    save_png_cut(Name_cut+"-c");
    //back to normal
    var x=app.activeDocument.historyStates.length;
    var sateref=app.activeDocument.historyStates[x-3];
    app.activeDocument.activeHistoryState=sateref;   
}

function make_mockup() {
var namevar = app.activeDocument.name;
app.activeDocument.resizeImage(1200,1200,600,ResampleMethod.AUTOMATIC,0);
app.activeDocument.selection.copy()

// //active a selective moc
app.activeDocument=app.documents.getByName("MOC.psd");

var moc = app.activeDocument.layerSets[0].layers.getByName("Place Sticker");
app.activeDocument.activeLayer=moc;
var STO = openSmartObject(moc);

STO.paste();
STO.layers[1].remove();

closeSmartObject();
app.activeDocument=app.documents.getByName("MOC.psd");
app.activeDocument.save()
save_png_moc(namevar.split('.')[0])
app.activeDocument=app.documents.getByName(namevar);
}



function main(Seleceted_moc,cnf) {    
//=============Start=========================
close_all();
//============open the mocFile ==============
if(cnf==false){
    var moc_file = File("C:/Geesci/MOC.psd");
    app.open( moc_file );
    Select_moc(Seleceted_moc);
}

//===========open the png prepare Folder ====
var png_Folder = new Folder ("C:/Geesci/png");
var png_file=png_Folder.getFiles();

for (var i=0 ; i<png_file.length; i++) {
    var format = png_file[i].name.split(".")[1]
    if ( (format=="png") || (format=="jpg") || (format=="PNG") ){
        app.open( png_file[i] );
        Geesci(cnf);
        app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);
   }
   //close the png prepare Folder

}
//close the mockup
if(cnf==false){
    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);}

alert("Finish");

}

// //mocuping
// var clonidoc=app.documents.getByName("Dragon.png");
// app.activeDocument=clonidoc
// clonidoc.selection.copy()

// //active a selective moc
// app.activeDocument=app.documents.getByName("CUT-moc.psd");
// var doc_main = app.activeDocument;
// var moc = doc_main.layers.getByName("cut-obj");
// app.activeDocument.activeLayer=moc;
// var STO = openSmartObject(moc);

// STO.layers[0].visible=false;
// STO.paste();

// closeSmartObject()
// //_________________________________
// var doc_chap = app.documents.getByName("Cookie.png");
// app.activeDocument=doc_chap
// //chapp
// var White=new RGBColor;White.blue=255;White.green=255;White.red=255;
// var Black=new RGBColor;Black.blue=0;Black.green=0;Black.red=0;
// doc_chap.selection.stroke(White,20,StrokeLocation.OUTSIDE,ColorBlendMode.NORMAL,100,false);
// save_png("mamadnobari",5);
// //______________________________

//use Style for Cut
//app.activeDocument.artLayers[0].applyStyle("cut");

//work with history
// var sateref=app.activeDocument.historyStates.getByName("Open");
// app.activeDocument.activeHistoryState=sateref;


function close_all() {
    while (app.documents.length!=0) {
        app.activeDocument.close()
    }
          
}

function save_png_cut(name){
    var doc_c =app.activeDocument;
    var save_path_c = File(doc_c.path + '/cut/' + name  + '.png');
    var opt = new PNGSaveOptions();
    opt.compression=1;
    opt.interlaced = false
    doc_c.saveAs(save_path_c,opt,true,Extension.NONE);
}
function save_png_chap(name){
    var doc_p =app.activeDocument;
    var save_path_p = File(doc_p.path + '/chap/' + name  + '.png');
    var opt = new PNGSaveOptions();
    opt.compression=1;
    opt.interlaced = false
    doc_p.saveAs(save_path_p,opt,true,Extension.NONE);
}
function save_png_moc(name){
    var doc_p =app.activeDocument;
    var save_path_p = File(doc_p.path + '/png/moc/' + name  + '.png');
    var opt = new PNGSaveOptions();
    opt.compression=5;
    opt.interlaced = false
    doc_p.saveAs(save_path_p,opt,true,Extension.NONE);
}

function openSmartObject (theLayer) {
    if (theLayer.kind == "LayerKind.SMARTOBJECT") {
        var idplacedLayerEditContents = stringIDToTypeID( "placedLayerEditContents" );
        var desc2 = new ActionDescriptor();
        executeAction( idplacedLayerEditContents, desc2, DialogModes.NO );
    };
    return app.activeDocument
}
function closeSmartObject() {
    app.activeDocument.save();
    app.activeDocument.close();    
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


function unlockLayer() {
    if(app.activeDocument.activeLayer.isBackgroundLayer ) app.activeDocument.activeLayer.name = 'From Background';
    if(app.activeDocument.activeLayer.allLocked) app.activeDocument.activeLayer.allLocked = false;
    if(app.activeDocument.activeLayer.pixelsLocked && app.activeDocument.activeLayer.kind != LayerKind.TEXT) app.activeDocument.activeLayer.pixelsLocked = false;
    if(app.activeDocument.activeLayer.positionLocked) app.activeDocument.activeLayer.positionLocked = false;
    if(app.activeDocument.activeLayer.transparentPixelsLocked && app.activeDocument.activeLayer.kind != LayerKind.TEXT) app.activeDocument.activeLayer.transparentPixelsLocked = false;
}
    