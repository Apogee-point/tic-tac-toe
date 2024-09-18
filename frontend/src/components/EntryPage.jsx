import { useState } from 'react';
import {
   MDBContainer,
   MDBTabs,
   MDBTabsItem,
   MDBTabsLink,
   MDBTabsContent,
   MDBBtn,
   MDBInput,
   MDBCheckbox
} from 'mdb-react-ui-kit';
import { useNavigate } from "react-router-dom";

function EntryPage() {
   const [justifyActive, setJustifyActive] = useState('tab1');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [username, setUsername] = useState('');
   const [agreeTerms, setAgreeTerms] = useState(false);
   const navigate = useNavigate();
   const handleJustifyClick = (value) => {
      if (value === justifyActive) {
         return;
      }
      setJustifyActive(value);
   };

   const SignUpUser = async (event) => {
      event.preventDefault();
      const url = justifyActive === 'tab1' ? 'http://localhost:5050/api/login' : 'http://localhost:5050/api/register';
      const data = justifyActive === 'tab1' ? { email, password } : { username, email, password };

      try {
         const response = await fetch(url, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
         });

         const result = await response.json();
         if (response.ok) {
            if(justifyActive === 'tab1'){
               const {token, name} = result;
               localStorage.setItem('token',token);
               localStorage.setItem('name',name);
               navigate('/home');
            }
            console.log('Success:', result);
         } else {
            console.error('Error:', result);
         }
      } catch (error) {
         console.error('Error:', error);
      }
   };

   return (
      <MDBContainer className="p-3 my-5 d-flex flex-column w-50">
         <MDBTabs pills justify className='mb-3 d-flex flex-row justify-content-between'>
            <MDBTabsItem>
               <MDBTabsLink onClick={() => handleJustifyClick('tab1')} active={justifyActive === 'tab1'}>
                  Login
               </MDBTabsLink>
            </MDBTabsItem>
            <MDBTabsItem>
               <MDBTabsLink onClick={() => handleJustifyClick('tab2')} active={justifyActive === 'tab2'}>
                  Register
               </MDBTabsLink>
            </MDBTabsItem>
         </MDBTabs>

         <MDBTabsContent>
            {justifyActive === 'tab1' ? 
            <form onSubmit={SignUpUser}>
               <MDBInput wrapperClass='mb-4' label='Email address' id='form1' type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
               <MDBInput wrapperClass='mb-4' label='Password' id='form2' type='password' value={password} onChange={(e) => setPassword(e.target.value)} />

               <div className="d-flex justify-content-between mx-4 mb-4">
                  <MDBCheckbox name='flexCheck' value='' id='flexCheckDefault' label='Remember me' />
                  <a href="!#">Forgot password?</a>
               </div>

               <MDBBtn className="mb-4 w-100" type="submit">Sign in</MDBBtn>
               <p className="text-center">Not a member? <a href="#!">Register</a></p>
            </form> :
            <form onSubmit={SignUpUser}>
               <MDBInput wrapperClass='mb-4' label='Username' id='form1' type='text' value={username} onChange={(e) => setUsername(e.target.value)} />
               <MDBInput wrapperClass='mb-4' label='Email' id='form2' type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
               <MDBInput wrapperClass='mb-4' label='Password' id='form3' type='password' value={password} onChange={(e) => setPassword(e.target.value)} />

               <div className='d-flex justify-content-center mb-4'>
                  <MDBCheckbox name='flexCheck' id='flexCheckDefault' label='I have read and agree to the terms' checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
               </div>

               <MDBBtn className="mb-4 w-100" type="submit">Sign up</MDBBtn>
            </form>
            }
         </MDBTabsContent>
      </MDBContainer>
   );
}

export default EntryPage;