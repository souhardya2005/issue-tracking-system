import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Box, Button, TextField, Typography, Paper,Container} from "@mui/material";
import Alert from "@mui/material/Alert";


export default function Index() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const loginResponse = await axios.post(
                "http://localhost:8000/api/login/",
                {
                    username: username,
                    password: password
                }
            );
        const accessToken = loginResponse.data.access;
        const refreshToken = loginResponse.data.refresh;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        const userResponse = await axios.get(
            "http://localhost:8000/api/registration/",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        const users = userResponse.data;
        const currentUser = Array.isArray(users)
            ? users.find((user) => user.username === username): users;
            console.log("CURRENT USER:", currentUser);
            console.log("CURRENT USER ROLE:", currentUser?.role);
        localStorage.setItem("user",JSON.stringify(currentUser));

        router.push("/issuetracking/project/");

    } catch (error) {
        if (error.response?.status === 401) {
            console.error("Invalid username or password");
        } else {
            console.error("Login error:", error);
        }
    }
};
    return (

        <div>

            <Container maxWidth="sm">

                <Box
                    sx={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >

                    <Paper
                        elevation={6}
                        sx={{
                            width: "100%",
                            maxWidth: 420,
                            p: 4,
                            borderRadius: 3,
                        }}>
                        <Typography
                            variant="h4"
                            align="center"
                            fontWeight="bold"
                            gutterBottom>Sign In</Typography>
                        <Typography
                            variant="body2"
                            align="center"
                            color="text.secondary"
                            sx={{
                                mb: 3
                            }}>Login to your account</Typography>
                        <Box
                            component="form"
                            onSubmit={handleSignIn}>
                            <TextField
                                fullWidth
                                label="Username"
                                variant="outlined"
                                margin="normal"
                                value={username}
                                onChange={(e) =>setUsername(e.target.value)}required/>
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={password}
                                onChange={(e) =>setPassword(e.target.value)}required/>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{
                                    mt: 3,
                                    py: 1.5,
                                    borderRadius: 2,
                                }}> SignIn</Button>
                        </Box>
                    </Paper>
                </Box>
            </Container>
        </div>
    );
}