import React, { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { Box, Button, TextField, Typography, Paper,MenuItem } from "@mui/material";
import Alert from '@mui/material/Alert';
export default function Index() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [username, setUsername] = useState("")
  const [role, setRole] = useState("")

  const handleSignUp = async (e) => {
        e.preventDefault()
            await axios.post(
                "http://localhost:8000/api/registration/",
                {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: password,
                    mobile: mobile,
                    username: username,
                    role: role
                });
            <Alert severity="success">Successful..</Alert>   
            router.push("/")
        }

  return (
    <div>
        <div>
          <Box
            component="form" onSubmit={handleSignUp}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
              maxWidth: 450,
              margin: "auto",
              padding: 3,
            }}>
            <Paper
              elevation={6}
              sx={{
                width: "100%",
                maxWidth: 420,
                p: 4,
                borderRadius: 3,
            }}>
          <Typography variant="h4" textAlign="center" mb={1}>Sign Up</Typography>

          <TextField
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            fullWidth/>

          <TextField
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth/>

          <TextField
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth/>

          <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth/>

         <TextField
          label="Mobile"
          type="text"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          fullWidth/>

          <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth/>

          <TextField
            select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            fullWidth>
            <MenuItem value="">Select Role</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="DEVELOPER">Developer</MenuItem>
            <MenuItem value="USER">User</MenuItem>
          </TextField>

          <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{
            mt: 1,
            py: 1.3,
          }}>Sign Up</Button>
          </Paper>
      </Box>
      
      </div>
</div>
  )}