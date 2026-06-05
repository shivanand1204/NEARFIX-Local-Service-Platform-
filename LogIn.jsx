import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";
import { setUserToken } from "./../../utils/cookies/setUserToken";
import "./Login.css";
import back from "./images/back.png";

function LogIn() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    var cookies = new Cookies();

    useEffect(() => {
        const userId = cookies.get("user_token");
        if (userId) {
            toast.success("Already logged in, redirecting...");
            setTimeout(() => navigate("/"), 2000);
        }
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Continue clicked - email:', email, 'password:', password);
        setLoading(true);
        toast.info('Logging in...');
        
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        
        fetch('http://localhost:8080/api/user/login', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: trimmedEmail,
                password: trimmedPassword,
            }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errData => {
                    throw new Error(errData.msg || 'Login failed');
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log('Login success:', data);
            toast.success(data.msg || 'Login successful');
            setUserToken(data.user_id);
            setTimeout(() => navigate("/"), 2000);
        })
        .catch((error) => {
            console.error('Login error:', error);
            toast.error(error.message);
        })
        .finally(() => setLoading(false));
    };

    const handleTest = () => {
        setEmail("shivanandshivpura@gmail.com");
        setPassword("7654321");
        toast.success('Test credentials loaded');
    };

    return (
        <div className="login_main_container">
            <img className="login_main_back" src={back} onClick={() => navigate("/")} alt="back" />
            <div className="container login_form">
                <form onSubmit={handleSubmit}>
                    <div className="login_form_heading">User Login</div>
                    <div className="login_form_input">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="login_form_input">
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="login_form_button">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Logging...' : 'Continue'}
                        </button>
                        <button type="button" onClick={handleTest} disabled={loading}>Test</button>
                    </div>
                    <div className="login_form_switch">
                        Don't have an account? <span><Link to="/user/signup">Sign Up</Link></span>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LogIn;

