function START_PUSH(){
  var PushOrTransfer = "PUSH";
  GetUsersFromGroup(PushOrTransfer);
}
function START_TRANSFER(){
  var PushOrTransfer = "TRANSFER";
  GetUsersFromGroup(PushOrTransfer);
}





// ***** Get Group Members ***** \\
// ***** Get Group Members ***** \\
// ***** Get Group Members ***** \\
function GetUsersFromGroup(PushOrTransfer) {
  var rootGroup = 'share@appsdemo.se';
  var groupTreeUsers = [];
  var groups = [];
  groups.push(rootGroup);
  
  while (groups.length > 0) {
    var currentGroup = groups.pop();
    var groupName = AdminDirectory.Groups.get(currentGroup).name;
    var groupMembers = GetUsersFromGroupSlave0(currentGroup);
    
    for (var i in groupMembers) {
      if (groupMembers[i].type == 'USER') {
        groupTreeUsers.push([groupName, groupMembers[i].email])   
        var groupMemberEmailAddresses = [];
        groupMemberEmailAddresses.push(groupMembers[i].email)
        if(PushOrTransfer == 'PUSH')
        {
        PushFolderToRoot(groupMemberEmailAddresses);  
        }
        else
        {
        StealOwnerShip(groupMemberEmailAddresses);  
        }
      }
      else if (groupMembers[i].type == 'GROUP') {
        groups.push(groupMembers[i].email)
      }        
    }
  }
}
function GetUsersFromGroupSlave0(group) {
  var memberPageToken, memberPage;
  var members = [];
  do {
    memberPage = AdminDirectory.Members.list(group, {
      maxResults: 200,
      pageToken: memberPageToken
    });
    var pageMembers = memberPage.members;
    if (pageMembers) {
      for (var j =0; j < pageMembers.length; j++) {
        members.push(pageMembers[j]);
      }
    }
    memberPageToken = memberPage.nextPageToken;
  } while (memberPageToken);
  return members;
}
// ***** Get Group Members ***** \\
// ***** Get Group Members ***** \\
// ***** Get Group Members ***** \\





// ***** Push Folder To Root ***** \\
// ***** Push Folder To Root ***** \\
// ***** Push Folder To Root ***** \\
function PushFolderToRoot(groupMemberEmailAddresses) {
  for(var i=0; i<groupMemberEmailAddresses.length;i++) {
    var GMEA = groupMemberEmailAddresses[i];
    PushFolderToRootSlave0(GMEA);   
  }
}
function PushFolderToRootSlave0(GMEA) {
  var ts = tokenService(GMEA);
  LibDrive.Init(ts);
  var dSA = LibDrive.ServiceAccount(GMEA);
  return dSA.pushFolderToRoot("0B5tng1JsgIgheXhtbThYaWRsZmc", GMEA); 
}
// ***** Push Folder To Root ***** \\
// ***** Push Folder To Root ***** \\
// ***** Push Folder To Root ***** \\





// ***** Transfer Ownership ***** \\
// ***** Transfer Ownership ***** \\
// ***** Transfer Ownership ***** \\
function StealOwnerShip(groupMemberEmailAddresses) {
  for(var i=0; i<groupMemberEmailAddresses.length;i++) {
    var GMEA = groupMemberEmailAddresses[i];
    var objData = StealOwnerShipSlave0(GMEA); 
    
    for(var i in objData.fileObjs){               
      var ownerEmail = objData.fileObjs[i].Owner; 
      var fileId = objData.fileObjs[i].id;
      if (ownerEmail != "drive.service@appsdemo.se") {
        StealOwnerShipSlave1(ownerEmail, fileId);
      }    
    }       
  }
}
function StealOwnerShipSlave0(GMEA) {
  var ts = tokenService(GMEA);
  LibDrive.Init(ts);
  var dSA = LibDrive.ServiceAccount(GMEA);
  return dSA.getFilesInFolder("0B5tng1JsgIgheXhtbThYaWRsZmc");
}
function StealOwnerShipSlave1(ownerEmail, fileId) {
  var ts = tokenService(ownerEmail);
  LibDrive.Init(ts);
  var dSA = LibDrive.ServiceAccount(ownerEmail);
  return dSA.transferFileToUser(fileId, "drive.service@appsdemo.se");
}
// ***** Transfer Ownership ***** \\
// ***** Transfer Ownership ***** \\
// ***** Transfer Ownership ***** \\





// ***** Get Active User Token ***** \\
// ***** Get Active User Token ***** \\
// ***** Get Active User Token ***** \\
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
// ***** Get Active User Token ***** \\
// ***** Get Active User Token ***** \\
// ***** Get Active User Token ***** \\
