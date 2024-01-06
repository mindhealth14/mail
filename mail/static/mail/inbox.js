document.addEventListener('DOMContentLoaded', function() {


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');




// composeSubmit();

// End of document object model
});


// Function to handle submit button on the compose textarea
function composeSubmit(){
 
  const composeRecipients = document.querySelector('#compose-recipients').value;
  const composeSubject = document.querySelector('#compose-subject').value;
  const composeBody = document.querySelector('#compose-body').value;
  const url = `http://localhost:8000/emails`
  const options = {
    method: 'POST',
    body: JSON.stringify({
          recipients: composeRecipients,
          subject: composeSubject,
          body: composeBody
    })
  }

 // console.log(composeRecipients, composeBody, composeSubject)
 fetch(url, options)
 .then((response) => response.text())
 .then((result) => {
  console.log(result)
  load_mailbox('sent');
 })
 .catch((error) => console.log(error))

}

// Compose email from Harvard
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}






function load_mailbox(mailbox) {
  const emailsView = document.querySelector('#emails-view');
  const url = `http://localhost:8000/emails/${mailbox}`;

  fetch(url)
    .then((response) => response.json())
    .then((emails) => {
      const fragment = document.createDocumentFragment(); // Create a fragment

      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        const emailDiv = document.createElement('div');
        emailDiv.classList.add('d-flex');
        emailDiv.id = `data-row-${i}`;
        if (email.read == false) {
          emailDiv.classList.add('is_read');
      }

        emailDiv.innerHTML = `
        <hr>
          <div class="p-2 flex-fill title">${mailbox === 'sent' ? 'To: ' + email.recipients : 'From: ' + email.sender}</div>
          <div class="p-2 flex-fill" onclick="loadEmail(${email.id}, ${mailbox})" >Subject: ${email.subject}</div>
          <div class="p-2 flex-fill">Date: ${email.timestamp}</div> 
          <div class="p-2 flex-fill pointer" onclick="deleteEmail(${email.id}, ${mailbox === 'sent' ? true: false } )"> <i class="fa-solid fa-trash"></i></div>
        `;

             fragment.appendChild(emailDiv); // Append to fragment
        fragment.appendChild(document.createElement('hr'))
        console.log(email.id);

        // // You can add event listeners to trigger loadEmail()
        // emailDiv.addEventListener('click', () => {
        //   // console.log(emailDiv.id)
        //   
        // })

        document.querySelector('#email-view').style.display = 'none';

  
      }
      

      // Append the fragment once outside the loop for performance
      emailsView.innerHTML = ''; // Clear previous content
      emailsView.appendChild(fragment);
    });


  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}




// Load emails box 
function loadEmail(id, mailbox){

 document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
              read: true
      })
  })


  fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email => {
        
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#email-view').innerHTML = `
          <div>From: ${email.sender}</div>
          <div>To: ${email.recipients}</div>
          <div>Subject: ${email.subject}</div>
          <div>Timestamp: ${email.timestamp}</div>            
          
          <div id="email-buttons">
              <button class="btn-email mt-2" id="reply">Reply</button>
              <button class="btn-email mt-2 mx-2" id="archive">${email["archived"] ? "Unarchive" : "Archive"}</button>
              <button class="btn-email mt-2" onclick="deleteEmail(${email.id}, 'inbox')">Delete</button>
              
          </div>
          <hr>
          <div>
              ${email.body}
          </div>
          
        `;
          
          // Use an event listener to execute the archives 
          const archives = document.querySelector('#archive');
          const url = `/emails/${id}`;
          const options = {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived
            })
        }

          archives.addEventListener('click', () => {
              fetch(url,options )
              // .then(response => response.json())
                  .then(email => {
                      // console.log(email);
                      load_mailbox('inbox');
                  });
          })
          

          // use event listener to execute the reply buttons
          const replyBtn = document.querySelector('#reply');

          replyBtn.addEventListener('click', () => {

              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#compose-view').style.display = 'block';
              document.querySelector('#email-view').style.display = 'none';

              document.querySelector('#compose-recipients').value = email.sender;


              if (email.subject.slice(0,3) != "Re:") {
                  document.querySelector('#compose-subject').value = "Re:" + email.subject;
                
                }
              else {
                  document.querySelector('#compose-subject').value = email.subject;
              }
              
              document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n\n`;

          
          })

      
      })

}



// Delete Email function 

function deleteEmail(emailId, mailbox) {
 
  fetch(`/emails/delete/${emailId}`, {
      method: 'GET'
  })
  .then(response => {
      if (response.ok) {
          console.log('Email deleted successfully.');
          // Handle success, such as refreshing the mailbox or updating the UI
          console.log(mailbox)
          if (mailbox) {
            load_mailbox('sent')  
          } else {
            load_mailbox('inbox')  
          }     
         
      } else {
          console.error('Failed to delete email.');
          // Handle failure or display an error message to the user
      }
  })
  .catch(error => {
      console.error('Error:', error);
      // Handle network errors or other fetch-related issues
  });
}