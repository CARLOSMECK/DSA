// Add the libraries:
// MPlPXdVxNBhfaF3UVVEuMMMh00DPSBbB3 LibDrive 
// MJ5317VIFJyKpi9HCkXOfS0MLm9v2IJHf LibOAuth
//
// Create a service account under your script's dev console project
// Add the json Key to the script properties under "jsonKey"
// Add the serive account clientId to your domain Admin console under
//         `Manage API client access` with the scope:
//   https://www.googleapis.com/auth/drive
// Note: It may take 15 minutes to a few hours after adding the clientId 
// to the admin console before the api project becomes authorized on your domain
// The Error: There was an error requesting a Token from the OAuth server: unauthorized_client
// means you need to wait a bit longer

//admin.fileshare@piedtancagroup.com
//0B2XfBTL5aSGMRnRZeUFpNV8tU0U
// test folder: 0B2XfBTL5aSGMZTNwTDlwT2JqNjg
/*
function trigger_GetDriveFiles(){
var folder = DriveApp.getFolderById("0B2XfBTL5aSGMZTNwTDlwT2JqNjg");
var filesJSObj = GetDriveFiles(folder);
  
  
   for(var ownerEmail in filesJSObj){
    if(filesJSObj.hasOwnProperty(ownerEmail)){
    Logger.log(bulkFile(ownerEmail, filesJSObj[ownerEmail]));
    } 
  }
}

function GetDriveFiles(folder) {
  var files = {};
  var files2 = {}; 
  var fileIt = folder.getFiles();
  while (fileIt.hasNext()) {
    var f = fileIt.next();
    var owner = f.getOwner().getEmail();
    var id = f.getId();
    
    if (owner != "admin.fileshare@piedtancagroup.com"){
      if (!files[owner]) {
        files[owner] = [];
      }
      
      // push the file to the owner's array
      files[owner].push(id);
    }
    
  }

  // Get all the sub-folders and iterate
  var folderIt = folder.getFolders();
  while(folderIt.hasNext()) {
    fs = GetDriveFiles(folderIt.next());
    for (var i = 0; i < fs.length; i++) {
      files[owner].push(id); 
    }
  }

  return files;
}
*/

function trigger_GetDriveFiles() {
  var folder = DriveApp.getFolderById('0B2XfBTL5aSGMZTNwTDlwT2JqNjg');
var filesJSObj = convertToObj(GetDriveFiles(folder));
  
    for(var i in filesJSObj){
   // Logger.log(filesJSObj[i]) - Loggar File Id's i grupp
    if(filesJSObj.hasOwnProperty(i)){
    Logger.log(bulkFile(i, filesJSObj[i]));
    }
     
   // bulkFile(filesJSObj[i]); - Inget hände
  }
  
  
}

function GetDriveFiles(folder) {
  var files = [];
  var fileIt = folder.getFiles();
  while (fileIt.hasNext()) {
    var f = fileIt.next();
    var owner = f.getOwner().getEmail();
    var id = f.getId();
    if (owner != "admin.fileshare@piedtancagroup.com"){
      files.push({'id': id, 'owner': owner});
    }
  }
  var folderIt = folder.getFolders();
  while (folderIt.hasNext()) {
    files = files.concat(GetDriveFiles(folderIt.next()));
  }
   
  
  return files;
}

 

function convertToObj(files) {
  var filesObj = {};
  for (var i = 0; i < files.length; i++) {
    var owner = files[i].owner;
    if (!filesObj[owner]) {
      filesObj[owner] = [];
    }
    filesObj[owner].push(files[i].id);
  }
  return filesObj;
}



// ***** Bulk Test ***** \\
// ***** Bulk Test ***** \\
// ***** Bulk Test ***** \\
function bulkFile(ownerEmail, fileIds) {
  var ts = tokenService(ownerEmail);
  LibDrive.Init(ts);
  var dSA = LibDrive.ServiceAccount(ownerEmail);
 return dSA.batchPermissionChange(fileIds, "admin.fileshare@piedtancagroup.com"); //<-- This is the user that recieves the folder/file
}
// ***** Bulk Test ***** \\
// ***** Bulk Test ***** \\
// ***** Bulk Test ***** \\



function myFunction(){
   Logger.log(getAllFoldersOfUser("andy.strandberg@boulebar.se"));
}

function getAllFoldersOfUser(email, additionalOptions) {
  var ts = tokenService(email);
  LibDrive.Init(ts);
  var dSA = LibDrive.ServiceAccount(email);
  return dSA.getAllFolders(additionalOptions);
}
 
function GetFilesAndFolders(email, additionalOptions) {
  var ts = tokenService(email);
  LibDrive.Init(ts);
  var dSA = LibDrive.ServiceAccount(email);
  return dSA.getFoldersAndFilesInFolder(additionalOptions);
}


function checkToken(){
  var ts = tokenService("tshilumba.tapila@boulebar.se")
  LibDrive.Init(ts);
  Logger.log(LibDrive.checkToken());
}



// If userEmail is null the service account's token is returned   
function tokenService(userEmail){
  var userEmail = userEmail || ""
  var jsonKey = JSON.parse(PropertiesService.getScriptProperties().getProperty("jsonKey"));  
  var privateKey = jsonKey.private_key;
  var serviceAccountEmail = jsonKey.client_email; 
  if(!userEmail){userEmail = serviceAccountEmail};
  var sa = LibOAuth.init(privateKey, ['https://www.googleapis.com/auth/drive'], serviceAccountEmail).addUser(userEmail);
  var tokenObj  = JSON.parse(PropertiesService.getScriptProperties().getProperty(userEmail)) || {};
  
  return function(){
    var nowTime = parseInt((Date.now()/1000).toString().substr(0,10));
    if(!("token" in tokenObj) ||  tokenObj.expire < nowTime){
      var newToken = sa.requestToken().getToken(userEmail);
      PropertiesService.getScriptProperties().setProperty(userEmail, JSON.stringify(newToken));
      tokenObj.token = newToken.token;
      tokenObj.expire = newToken.expire;
    }
    return tokenObj.token;
  }
}
