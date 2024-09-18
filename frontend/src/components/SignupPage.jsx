import  { useState } from 'react';

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your signup logic here
    };

    return (
        <div>
            <h2>Signup Page</h2>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input type="email" value={email} onChange={handleEmailChange} />
                <br />
                <label>Password:</label>
                <input type="password" value={password} onChange={handlePasswordChange} />
                <br />
                <button type="submit">Signup</button>
            </form>
        </div>
    );
};

export default SignupPage;
