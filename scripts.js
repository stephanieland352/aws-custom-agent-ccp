
const loadCCP = () => {
    // Importing the DOM elements into variables to be used
    var container = document.getElementById("ccpContainer");
    var attributesDiv = document.getElementById("attributesDiv");
    var agentStatusDiv = document.getElementById("agentStatusDiv");
    var offlineButton = document.getElementById("setOffline");
    var readyButton = document.getElementById("setReady");
    var acceptButton = document.getElementById('acceptContact');
   var declineButton = document.getElementById('declineContact');
   
   var endChatButton = document.getElementById('endChat');
   var transferButton = document.getElementById('transferButton')
   
    var firstNameField = document.getElementById("firstName");
    var lastNameField = document.getElementById("lastName");
    var customerNumberField = document.getElementById("customerNumber");

    const chatBox = document.getElementById('customChatDisplay');
    const chatSidebar = document.getElementById('customChatDisplay__sidebar');
    const chatsWindow = document.getElementById('customChatDisplay__window');
    const chatInput = document.getElementById('customChatDisplay__input');

    
    //replace with the CCP URL for your Amazon Connect instance
    var ccpUrl = "#";
   
    
    // Initialize the CCP window
    connect.core.initCCP(container, {
        ccpUrl: ccpUrl,        
        loginPopup: true,               // optional, defaults to `true`
          loginPopupAutoClose: true,      // optional, defaults to `false`
          loginOptions: {                 // optional, if provided opens login in new window
            autoClose: true,              // optional, defaults to `false`
            height: 600,                  // optional, defaults to 578
            width: 400,                   // optional, defaults to 433
            top: 0,                       // optional, defaults to 0
            left: 0                       // optional, defaults to 0
          },
          region: "us-east-1",         // REQUIRED for `CHAT`, optional otherwise
          softphone: {                    // optional, defaults below apply if not provided
          //  allowFramedSoftphone: true,   // optional, defaults to false
            disableRingtone: false,       // optional, defaults to false
            ringtoneUrl: "./ringtone.mp3" // optional, defaults to CCP’s default ringtone if a falsy value is set
          },
          pageOptions: { //optional
            enableAudioDeviceSettings: false, //optional, defaults to 'false'
         //   enablePhoneTypeSettings: true //optional, defaults to 'true' 
          },
          ccpAckTimeout: 5000, //optional, defaults to 3000 (ms)
          ccpSynTimeout: 3000, //optional, defaults to 1000 (ms)
          ccpLoadTimeout: 10000 //optional, defaults to 5000 (ms)
    });
   
    connect.ChatSession.SessionTypes = {
        AGENT: 'AGENT',
        CUSTOMER: 'CUSTOMER'
      };
    connect.ChatSession.setGlobalConfig({
        loggerConfig: { // optional, the logging configuration. If omitted, no logging occurs
          logger: { // optional, a logger object implementation
            debug: (msg) => console.debug(msg), // REQUIRED, can be any function
            info: (msg) => console.info(msg), // REQUIRED, can be any function
            warn: (msg) => console.warn(msg), // REQUIRED, can be any function
            error: (msg) => console.error(msg) // REQUIRED, can be any function
          },
          level: connect.ChatSession.LogLevel.ERROR, // optional, defaults to: `connect.ChatSession.LogLevel.INFO`
        },
        region: "us-east-1", // optional, defaults to: "us-west-2"
      });


    connect.core.onInitialized(()=>{
        
        
    })
       connect.agent(subscribeToAgentEvents);
     connect.contact(subscribeToContactEvents);
    
   
    connect.core.onViewContact((event) => {
        // new contact viewed
        let id = event.contactId;

        setActiveContactID(id)
        
      });

      
     const changeContactView = contactID => {
     
        connect.core.viewContact(contactID);
     }
     
    function subscribeToAgentEvents(agent) {
        const config = agent.getConfiguration();
      //  console.log("here is your configuration: " + JSON.stringify(config));
        const states = agent.getAgentStates();
     //   console.log("here are your states: " + JSON.stringify(states));

// Subscribing to Streams API Long Polling Agent events
        agent.onRefresh(handleAgentRefresh);
        agent.onRoutable(handleAgentRoutable);
        agent.onNotRoutable(handleAgentNotRoutable);
        agent.onOffline(handleAgentOffline);
        agent.onStateChange(handleAgentStateChange);
        agent.onError(handleAgentError);
        agent.onSoftphoneError(handleAgentSoftphoneError)
        agent.onWebSocketConnectionLost(handleAgentWebSocketConnectionLost)
        agent.onWebSocketConnectionGained(handleAgentWebSocketConnectionGained)
        agent.onAfterCallWork(handleAgentAfterCallWork)

        // Agent Methods
       const agentName = agent.getName()
       const agentConfiguration = agent.getConfiguration();

        // Set the DOM button elements behaviour 

        readyButton.addEventListener('click', goAvailable)
        offlineButton.addEventListener('click', goOffline)
        declineButton.addEventListener('click', declineContact)
        endChatButton.addEventListener('click', endContact)
        acceptButton.addEventListener('click', acceptContact)
        transferButton.addEventListener('click', startChatTransfer)


         $(document).on("click", ".chat-contact", function() {
         var data =  $(this).data('contactid');
         
         setActiveContactID(data);
         if($(this).hasClass('active')){
             return;
         }
         $('.chat-contact').removeClass('active');
         $(this).addClass('active')
         changeContactView(data);
         });

        $(document).on('click', "#closeChat", function(){
            var id = $(this).data('contactid');

            let contact = getContactByID(id);
            contact.clear({
               success: function() { 
                   
                   const sidebarTab = document.querySelector(".chat-contact[data-contactid='" + id + "']");
                   sidebarTab.remove();
                   chatsWindow.innerHTML = '';
                   
                   updateContactList("REMOVE", id);
                   
                },
               failure: function(err) { 
                }
            });
        });
            
        // build sidebar and chat window
       // buildChatArea()
         buildHardcodedChatWindow()
        
    }
    const handleAgentAfterCallWork = agent => {
        // handle agent after call work
        

    }
    const handleAgentWebSocketConnectionGained = agent => {
       // handle agent web socket connection gained
    }
    const handleAgentWebSocketConnectionLost = agent => {
        // handle agent web socket connection lost
    }
    const handleAgentError = agent => {
        // handle agent error
        

    }
    const handleAgentSoftphoneError = agent => {
        // handle agent softphone error
        
    }
    
    // We will log in the browsers console any new agent status
    function handleAgentStateChange(agentStateChange) {
      //  handle Agent state changed. New state is  newState
        const {newState} = agentStateChange;
        
        displayAgentStatus(newState);
       
    }
 

    function handleAgentRefresh(agent) {
       // handle Agent data refreshed. Agent status is  agent.getStatus().name
    }

    function handleAgentRoutable(agent) {
        // handle Agent is routable. Agent status is ' + agent.getStatus().name
    }

    function handleAgentNotRoutable(agent) {
       // handle Agent is online, but not routable. Agent status is ' + agent.getStatus().name
    }

    function handleAgentOffline(agent) {
       // handle Agent is offline. Agent status is ' + agent.getStatus().name
    }

    const getContactsList = () => {
        return JSON.parse(window.localStorage.getItem('contacts'));
    }
    const getCurrentContactsList = () => {
        let storageList = getContactsList();
    
        // if it is empty check the agent contacts 
        if(! storageList){
            storageList = []
            const agent = new connect.Agent();
            let agentContacts = agent.getContacts();
            agentContacts.forEach(contact => {
                storageList.push(contact.contactId);
            })
            localStorage.setItem("contacts", JSON.stringify(storageList));

        }
        return storageList;
    }
    const updateContactList = (how, contactID) => {
        contactsArray = getContactsList();
        
        if(how === 'ADD') {
            contactsArray.push(contactID);

        } else if(how === 'REMOVE') {
            
            contactsArray.remove(contactID);

            const activeID = getActiveContactID()
            if(contactID === activeID){
                localStorage.removeItem('current-contact');
            }

        }
        
        localStorage.setItem("contacts", JSON.stringify(contactsArray));
    }

    const setActiveContactID = ID => {
        localStorage.setItem("current-contact", JSON.stringify(ID)); 
    }
    const getActiveContactID = () => {
        const activeID = window.localStorage.getItem('current-contact');
        
        return (activeID !== 'undefined' ? JSON.parse(activeID) : false)
    }

    const getContactByID = contactID => {
        let agent = new connect.Agent();
        let agentContacts = agent.getContacts();
        
        const contactOBJ = agentContacts.find(cnn => cnn.contactId === contactID);
        
        return contactOBJ 
    }
    const buildHardcodedChatWindow = () => {
        chatsWindow.innerHTML = '';

        const chatWindow = document.createElement('div');
    
            const contactName = 'Stephanie';
            const Transcript = [
                    {
                        "AbsoluteTime": "2022-02-09T19:38:56.000Z",
                        "Content": null,
                        "ContentType": "application/vnd.amazonaws.connect.event.participant.joined",
                        "Id": "1575f3d4-5557-487e-93fe-ef2f54cdfba6",
                        "Type": "EVENT",
                        "ParticipantId": "19f46312-a3ae-4733-9b98-1a9bd5bf44e3",
                        "DisplayName": "Stephanie",
                        "ParticipantRole": "CUSTOMER"
                    },
                    {
                        "AbsoluteTime": "2022-02-09T19:38:58.997Z",
                        "Content": "Hi you are being put into queue",
                        "ContentType": "text/plain",
                        "Id": "ddc3674a-b205-4f54-a1c8-dbe3b622cdb0",
                        "Type": "MESSAGE",
                        "ParticipantId": "35bb3690-5615-4d7f-b4ee-db8865dda7c4",
                        "DisplayName": "SYSTEM_MESSAGE",
                        "ParticipantRole": "SYSTEM"
                    },
                    
                    {
                        "AbsoluteTime": "2022-02-09T19:48:19.847Z",
                        "Content": "hello, how can I help you?",
                        "ContentType": "text/plain",
                        "Id": "b548490f-7ca7-4671-bfba-a7477be50edf",
                        "Type": "MESSAGE",
                        "ParticipantId": "f47c2275-95fa-47e2-992c-470d2a15fd25",
                        "DisplayName": "Maria",
                        "ParticipantRole": "AGENT"
                    },
                    {
                        "AbsoluteTime": "2022-02-09T19:51:25.512Z",
                        "Content": "Here is some insurance information. Account #1234",
                        "ContentType": "text/plain",
                        "Id": "29e06168-8b45-4c34-b10f-923766ec3b9b",
                        "Type": "MESSAGE",
                        "ParticipantId": "19f46312-a3ae-4733-9b98-1a9bd5bf44e3",
                        "DisplayName": "Stephanie",
                        "ParticipantRole": "CUSTOMER"
                    },
                    {
                        "AbsoluteTime": "2022-02-09T19:51:26.111Z",
                        "Content": "Thanks. Here is some info about your insurance",
                        "ContentType": "text/plain",
                        "Id": "abf906c1-72c7-47fd-94da-2976920436d9",
                        "Type": "MESSAGE",
                        "ParticipantId": "f47c2275-95fa-47e2-992c-470d2a15fd25",
                        "DisplayName": "Maria",
                        "ParticipantRole": "AGENT"
                    },
                    {
                        "AbsoluteTime": "2022-02-09T19:51:40.687Z",
                        "Content": "Great. I also have a billing question",
                        "ContentType": "text/plain",
                        "Id": "c999e25b-bf32-4a25-a3c6-5dca1a63bfd0",
                        "Type": "MESSAGE",
                        "ParticipantId": "19f46312-a3ae-4733-9b98-1a9bd5bf44e3",
                        "DisplayName": "Stephanie",
                        "ParticipantRole": "CUSTOMER"
                    },
                    {
                        "AbsoluteTime": "2022-02-09T19:51:41.138Z",
                        "Content": "Ok, I will have to transfer you. One moment",
                        "ContentType": "text/plain",
                        "Id": "8e2ab9d8-62cf-42c8-8957-d8d1945569d1",
                        "Type": "MESSAGE",
                        "ParticipantId": "f47c2275-95fa-47e2-992c-470d2a15fd25",
                        "DisplayName": "Maria",
                        "ParticipantRole": "AGENT"
                    }
                ]
            
           
          
             chatWindow.style.border = '2px solid black';
             chatWindow.style.margin = '5px';
             chatWindow.style.padding = '5px';
             const chatWindowHeader = document.createElement('div');
             chatWindowHeader.innerText = "Chat with " + contactName;
             chatWindow.appendChild(chatWindowHeader)
            
             
             Transcript.forEach(message => {

                const chatMessage = buildIndividualChatMessage(message);
                 
               if(chatMessage){
                chatWindow.appendChild(chatMessage);
               }  
             })
        
             const helpMessage = document.createElement('h4')
             helpMessage.innerHTML = 'Example Chat Conversation';
             chatsWindow.appendChild(helpMessage)
             chatsWindow.appendChild(chatWindow)
       

    }

    const buildIndividualChatMessage = message => {
        if(! message.Content) {return false} 
        const chatMessage = document.createElement('div');
      
        chatMessage.dataset.role = message.ParticipantRole;
        chatMessage.innerText = message.Content
        chatMessage.className = 'chat-message'
        chatMessage.style.borderBottom = '1px dashed lightgrey'
        chatMessage.padding = '5px';
        chatMessage.margin = '5px';

        const chatCheckbox = document.createElement('input');
        chatCheckbox.setAttribute("type", "checkbox");
        chatCheckbox.setAttribute("checked", "checked");
        chatCheckbox.style.display = 'none'
        chatMessage.append(chatCheckbox)

        return chatMessage;
    }
    const buildChatArea = () => {
        buildSidebar();
        buildWindow();
    }
    const buildWindow = async () => {
        const activeContactID = getActiveContactID();
        chatsWindow.innerHTML = '';

        if(! activeContactID){
            return;
        }

        const contact = getContactByID(activeContactID);
        
        if(! contact ) return;
        chatsWindow.dataset.contactid = activeContactID;

    const contactStatus = contact.getStatus()?.type;

    const chatWindow = document.createElement('div');
    
    if(contactStatus === 'connected' || contactStatus === 'connecting' ){

        const contactName = contact.getAttributes()?.customerName?.value;
        const transcriptData = await getTranscriptionData(contact);
        const { InitialContactId, NextToken, Transcript } = transcriptData;
         chatWindow.style.border = '2px solid red';
         chatWindow.style.margin = '5px';
         chatWindow.style.padding = '5px';
         const chatWindowHeader = document.createElement('div');
    
         if(contactName){
            chatWindowHeader.innerText = contactName;
         } else {
             chatWindowHeader.innerText = 'No Name'
         }
         chatWindow.appendChild(chatWindowHeader)         
         Transcript.forEach(message => {
            const chatMessage = buildIndividualChatMessage(message);
             
           if(chatMessage){
            chatWindow.appendChild(chatMessage);
           }  
         })
        
    } else {
        chatsWindow.innerHTML = 'Chat ended <button id="createTask">Create Task</button> <button data-contactid="'+contact.contactId+'" id="closeChat">Close Chat</button>';
    }
    chatsWindow.appendChild(chatWindow)
    }
    
    const buildSidebar = () => {
       
        chatSidebar.innerHTML = ''

    
        let contacts = getCurrentContactsList();
   
        
        if(contacts.length === 0 ){
            return
        }
            contacts.forEach(contactID => {
                
                contact = getContactByID(contactID)

               
                if(! contact) return;
                

               const contactOption = buildSidebarTab(contact)
       
        chatSidebar.appendChild(contactOption);



            });
    }
    const buildSidebarTab = contact => {

        const contactName = contact.getAttributes()?.customerName?.value;
        // build the sidebar buttons

    const contactOption = document.createElement('div');
    const activeContact = getActiveContactID()
  
    if(contactName){
        contactOption.innerText = contactName + ' - ' + contact.getStatus().type;
    } else {
        contactOption.innerText = 'Customer - '  + contact.getStatus().type;
    }


    contactOption.dataset.contactid = contact?.contactId

    contactOption.className = "chat-contact";
 
    if(contact?.contactId === activeContact ) {
        contactOption.classList.add('active')
    }

    return contactOption;
  

    }
   const getTranscriptionData = async (contact) => {
    const cnn = contact.getConnections().find(cnn => cnn.getType() === connect.ConnectionType.AGENT);
    
    agentChatSession = await cnn.getMediaController();
   

    const transcriptData = await agentChatSession.getTranscript({
        maxResults: 100,
        sortOrder: "ASCENDING"
      });

     return transcriptData.data;

   }

    

    function subscribeToContactEvents(contact) {

        
      
         // Subscribing to Streams API Long Polling Contact events
         if (contact.getActiveInitialConnection() 
         && contact.getActiveInitialConnection().getEndpoint()) {
             // This is a new contact
       } else {
           // This is an existing contact for this agent
           
     }
        // contact methods
        const queueName = contact.getQueue().name
       const contactAttributes = contact.getAttributes()
    // returns a formatted string with the contact event and id. The argument must be a value of the ContactEvents enum
        const contactEventName = contact.getEventName(connect.ContactEvents.CONNECTED);

        
        contact.onError(handleContactError)
         contact.onIncoming(handleContactIncoming);
         contact.onConnecting(handleContactConnecting)
         contact.onAccepted(handleContactAccepted);
         contact.onPending(handleContactPending)
         contact.onConnected(handleContactConnected);
         contact.onEnded(handleContactEnded);
         contact.onACW(handleContactACW)
         contact.onDestroy(handleContactDescroy)
         contact.onMissed(handleContactMissed)
         contact.onRefresh(handleContactRefresh)

         
        
    }
    const handleContactRefresh = contact => {
        // handle contact refreshed

    }
    const handleContactPending = contact => {
    // handle contact is pending

    }
    const handleContactConnecting =  contact => {
       // handle contact is connecting
        acceptButton.disabled = false;
        acceptButton.classList.add('ringing');
        acceptButton.dataset.contactid = contact.getContactId();

        declineButton.disabled = false;
        declineButton.classList.add('ringing');
        declineButton.dataset.contactid = contact.getContactId();


    }
    const handleContactMissed = contact => {
       // handle contact is missed

    }
    const handleContactDescroy = contact => {
        // handle contact is destroyed
    }
    const handleContactError = contact => {
        // handle contact is error

    }
    
    const handleContactACW = (contact) => {
        // handle contact is acw - This is after the connection has been closed, but before the contact is destroyed
     
    }

    const handleContactIncoming= (contact) => {
        // handle contact is incoming
        
    }

    const handleContactAccepted =  async (contact) => {
       //handle contact accepted
        if (contact) {
            
          // Contact accepted by agent. Contact state is contact.getStatus().type

            setActiveContactID(contact.getContactId());
            updateContactList('ADD', contact.getContactId);
          
        } 

    }
    const handleContactConnected = async (contact) => {
        // handle contact is connected
        
        buildAgentChatSession(contact)

    }

    function handleContactEnded(contact) {
        // handle contact is ended contact state is contact.getStatus().type
        
    }

  const buildAgentChatSession =  async contact => {
    contact.getConnections().forEach( async (connection) => {
        const contactId = connection.getContactId();
        const connectionId = connection.getConnectionId();
        const endpoint = connection.getEndpoint();
       const state = connection.getState();
       const millis = connection.getStateDuration();
       const type = connection.getType();
      const monitorInfo = connection.getMonitorInfo();
      const isInitialConnection = connection.isInitialConnection()
      const isConnectionActive = connection.isActive();
      const isConnectionConnected = connection.isConnected()
      const isConnectionConnecting = connection.isConnecting()
      const isConnectionOnHold = connection.isOnHold()

        if(connection.getType() === connect.ConnectionType.AGENT) {
            // agent events
        const agentChatSession = await connection.getMediaController()
            agentChatSession.onConnectionEstablished(event => {
                // event on connection established
                 const { chatDetails } = event;
               });

               agentChatSession.onMessage( async (event) => {
                   // agent received message
            const { chatDetails, data } = event;

                // Example of how to respond automatically to each customer message
        //    if(data.ParticipantRole === "CUSTOMER" && data.Type ==="MESSAGE"){
        //  const awsSdkResponse = await agentChatSession.sendMessage({
        //     contentType: "text/plain",
        //     message: "Thanks for the message"
        //   });
        //   const { AbsoluteTime, Id } = awsSdkResponse.data
        //    }
    
         
            });

        }  else {
            // Customer events
            const customercController = await connection.getMediaController()
    
            customercController.onConnectionEstablished(event => {
                 const { chatDetails } = event;
                 
               });

        }
                
      });

  }

    function displayAgentStatus(status) {
        agentStatusDiv.innerHTML = 'Agent Status: <span style="font-weight: bold">' + status + '</span>';
    }

  

    function goAvailable() {
        const agent = new connect.Agent();
        // Streams API call to the first Routable state availale to the Agent
        // Logging results to the console and setting the DOM button UI to the 'Available' state
        // not allowed to change agent status when the agent has a connected call.
        var routableState = agent.getAgentStates().filter(function (state) {
            return state.type === connect.AgentStateType.ROUTABLE;
        })[0];
        agent.setState(routableState, {
            success: function () {
               // Set agent status to Available via Streams
            },
            failure: function () {
                // Failed to set agent status to Available via Streams
            }
        });
    }

    function goOffline() {
        const agent = new connect.Agent();
        // Streams API call to the first Offline state availale to the Agent
        // Logging results to the console and setting the DOM button UI to the 'Offline' state
        //not allowed to change agent status when the agent has a connected call.
        var offlineState = agent.getAgentStates().filter(function (state) {
            return state.type === connect.AgentStateType.OFFLINE;
        })[0];
        agent.setState(offlineState, {
            success: function () {
                // Succesfully set agent status to Offline via Streams
            },
            failure: function () {
                // Failed to set agent status to Offline via Streams
            }
        });
    }
    const endContact = () => {
        const contactID = getActiveContactID()
        const contact = getContactByID(contactID);
        connection = contact.getConnections().find(cnn => cnn.getType() === connect.ConnectionType.AGENT);

        connection.destroy({
            success: function() { 
                // contact removed
                updateContactList('REMOVE', contactID)
              
             },
            failure: function(err) { 
             }
         });

    }

    function acceptContact() {
       
        const contact = getContactByID(acceptButton.dataset.contactid);
        contact.accept({
            success: function () {
                // accepted via streams
                acceptButton.disabled = true;
                acceptButton.classList.remove('ringing');
                declineButton.disabled = true;
                declineButton.classList.remove('ringing');
                
            },
            failure: function () {
                // Failed to establish connection via Streams
            }
        });
    }

    function declineContact() {
        const contact = getContactByID(declineButton.dataset.contactid);
        contact.reject({
            success: function() { 
                acceptButton.disabled = true;
                acceptButton.classList.remove('ringing');
                declineButton.disabled = true;
                declineButton.classList.remove('ringing');
            },
            failure: function(err) { /* ... */ }
         });
    }

    function disconnectContact() {
        // Streams API call to Drop a Connected Contact
        contact.getAgentConnection().destroy({
            success: function () {
                // Contact disconnected via Streams
            },
            failure: function () {
                // Failed to disconnect the contact via Streams
            }
        });
    }

    function showAttributes (contact) {

        // Gathers received CTR Contact Atrtributes, and displays them with the Contacts Phone Number
        var attributes = contact.getAttributes();
        
        if(attributes.customerName) {
            firstNameField.value = attributes.customerName.value;
        }
       
        attributesDiv.hidden = false;
    }


    const getQuickConnects =  async () => {
        

        return new Promise(function(resolve, reject) {


            var agent = new lily.Agent();

        agent.getEndpoints(agent.getAllQueueARNs(), {
        success: function(data){ 
          //  console.log("valid_queue_phone_agent_endpoints", data.endpoints, "You can transfer the call to any of these endpoints");
          resolve(data);
        },
        failure:function(){
        }
        });


            
              
          });
    }

    function transferToQuickConnect () {

        var agent = new lily.Agent();

        agent.getEndpoints(agent.getAllQueueARNs(), {
        success: function(data){ 
           // console.log("valid_queue_phone_agent_endpoints", data.endpoints, "You can transfer the call to any of these endpoints");
            agent.getContacts(lily.ContactType.VOICE)[0].addConnection(data.endpoints[6], {
            success: function(data) {
            alert("transfer success");
            },
            failure: function(data) {
                alert("transfer failed");
            }
            });
            
        },
        failure:function(){
            
        }
        });

    }
      const startChatTransfer = async () => {
        transferButton.disabled = 'true'
          // get current id
          const contactID = getActiveContactID();
          const contact = getContactByID(contactID)

          // display checkboxes on messages
         const messageCheckBoxes = document.querySelectorAll(".chat-message input");
         messageCheckBoxes.forEach(msg => {
             msg.style.display = 'block'
         })

      
          // add section with all the quick connect options
          const transferSection = document.createElement('div');
          transferSection.id = 'transferOptionsSection';

             // add messsage about selecting messages to transfer
         const transferInstructions = document.createElement('div');
         transferInstructions.innerText = 'Unselect messages then transfer'
         transferSection.prepend(transferInstructions)

         const cancelTransferButton = document.createElement('button');
        cancelTransferButton.innerText = 'Cancel Transfer';
        cancelTransferButton.style.margin = '20px';
        cancelTransferButton.onclick = () => {
            messageCheckBoxes.forEach(msg => {
                msg.checked = 'checked';
                msg.style.display ='none'
            })
            transferButton.disabled = false
            transferSection.remove()
        }
        transferSection.prepend(cancelTransferButton)

          const {endpoints} = await  getQuickConnects();

          if(endpoints.length > 0 ) {
            const transferOptions = document.createElement('div')
            endpoints.forEach(option => {
                const quickConnect = document.createElement('button');
                quickConnect.innerHTML = option.name;
                quickConnect.dataset.endpoint = option.endpoint;
                quickConnect.dataset.endpointname = option.name;
                quickConnect.className = 'quick-connect';
                quickConnect.onclick = () => {
                    transferbuttonClicked(option)
                    cancelTransferButton.remove()
                }   
                transferOptions.append(quickConnect);

            });
            
            transferSection.append(transferOptions)
          }
          
          const agentControlsDiv = document.getElementById('customCCPDiv')
          agentControlsDiv.append(transferSection)

          
      }

      const transferbuttonClicked = (endpoint) => {
          const transferPreview = document.createElement('div');
          transferPreview.id = 'transferPreviewMessages'
          transferPreview.innerHTML = '<h2>Preview of transfer to ' + endpoint.name + ' queue</h2>'
        const chatWindow = document.getElementById('customChatDisplay__window')
          // loop through the messages and collect those with checks still
          const messages = chatWindow.querySelectorAll(".chat-message");
          const specialSelectedMessages = document.createElement('div')
          
          messages.forEach(message => {
             const inputBox = message.getElementsByTagName('input');
             
             if(inputBox[0].checked ){
                 // Create a copy of it
let clone = message.cloneNode(true);
clone.removeChild(clone.getElementsByTagName('input')[0])

                 specialSelectedMessages.append(clone)
             }

          })
          // apppend confirm and submit buttons
          const previewButtonSection = document.createElement('div')
          const previewCancelButton = document.createElement('button');
          previewCancelButton.innerText = 'Cancel Transfer';
          previewCancelButton.style.backgroundColor = 'lightgrey';
          previewCancelButton.onclick = ()=> {
              transferPreview.remove()

          }
        
          const previewSubmitButton = document.createElement('button');
          previewSubmitButton.innerText = 'Send Transfer'
          previewSubmitButton.style.backgroundColor = 'lightgreen';
          previewSubmitButton.style.padding ='20px'
          previewSubmitButton.style.margin = '20px'
          previewSubmitButton.id ='previewTransferSubmitButton'
          previewSubmitButton.onclick =  () => {
            

            createNewChatWindow()

          }

          previewButtonSection.append(previewCancelButton)
          previewButtonSection.append(previewSubmitButton)

        
          transferPreview.append(specialSelectedMessages)
          transferPreview.append(previewButtonSection)
          const wrapper = document.getElementById('ccpWrapper')
          wrapper.append(transferPreview);
       
         
      }

      const createNewChatWindow = async () => {
        const transferPreview = document.getElementById('transferPreviewMessages')
        const messages = transferPreview.querySelectorAll(".chat-message")
        let messageRecap = ''
        messages.forEach(msg =>{
            messageRecap += msg.dataset.role + ": " + msg.innerText + "\r\n"
        }
           
        )

        // TODO change contact flow based on desired quick connect endpoint
    
        var contactFlowId = ''; // TODO: Fill in
        var instanceId = ''; // TODO: Fill in
        var apiGatewayEndpoint = ""; // TODO: Fill in 
        
    
        var initiateChatRequest = {
            ParticipantDetails: {
                DisplayName: 'Stephanie'
            },
            ContactFlowId: contactFlowId,
            InstanceId: instanceId
        };

        const apiDetails = await fetch(apiGatewayEndpoint, {
            method: 'POST',
            body: JSON.stringify(initiateChatRequest)
        }).then((response)=> {
            if(response.ok){
                return response.json()
            }
            return Promise.reject(response)
          })

        const chatDetails =   apiDetails.data.startChatResult
        
        createChatSession = await connect.ChatSession.create({
            chatDetails: chatDetails,
            type: "CUSTOMER",
           // websocketManager: connect.core.getWebSocketManager()
        });

        await createChatSession.connect().then((response) => {
            // successfull connection
            return response;
        }, (error) => {
            return Promise.reject(error);
        });
         await createChatSession.sendMessage({
            contentType: "text/plain",
            message: "The following is an edited execerpt of a previous conversation \r\n\r\n" + messageRecap
        })

        // Example of sending with metadata
//         createChatSession
//   .sendMessage({ 
//     contentType: "text/plain",
//         message: "The following is an edited execerpt of a previous conversation \r\n\r\n" + messageRecap,
//         metadata: "foo"
//    })
//   .then(
//       response => {
//         const { data, metadata } = response;
//         // ...
//         console.log(response)
//       }, (response) => {

//         const { error, metadata } = response;
//       });
          
      }
    
      
}


const loadApp = () => {
    
    loadCCP();
}
document.addEventListener("DOMContentLoaded", loadApp);