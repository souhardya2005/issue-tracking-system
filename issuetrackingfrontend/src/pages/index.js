import React from "react";
import { useRouter } from "next/router";
import {Box,Button,Container,Typography,Paper,} from "@mui/material";

export default function Index() {
  const router = useRouter();
  const handleSignIn = () => {router.push("/signin");}
  const handleSignUp = () => {router.push("/signup");}

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            padding: 5,
            textAlign: "center",
            borderRadius: 3,
          }}>
          
          <Typography
            variant="h2"
            fontWeight="bold"
            gutterBottom>TrackIT</Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 2 }}>Issue Tracking & Management System</Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}>
            Create, track, manage, and resolve issues efficiently
            from one place.</Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexDirection: { xs: "column", sm: "row" },
            }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSignIn}
              sx={{
                px: 5,
                py: 1.5,
              }}>Sign In</Button>

            <Button
              variant="outlined"
              size="large"
              onClick={handleSignUp}
              sx={{
                px: 5,
                py: 1.5,
              }}>Sign Up</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

