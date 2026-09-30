import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function IssueDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [issue, setIssue] =useState(null);
    const [comments, setComments] =useState([]);
    const [developers, setDevelopers] =useState([]);
    const [user, setUser] =useState(null);
    const [selectedDeveloper, setSelectedDeveloper] =useState("");
    const [newComment, setNewComment] =useState("");
    const [loading, setLoading] =useState(true);
    const [message, setMessage] =useState("");

    useEffect(() => {
        if (
            typeof window === "undefined"
        ) {
            return;
        }
        const storedUser =localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser =JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error(
                    "Invalid user data:",
                    error
                );
            }
        }}, []);

    const fetchIssue = async () => {
        try {
            const token =localStorage.getItem("accessToken");
            const response =
                await axios.get(
                    `http://127.0.0.1:8000/api/issue-detail/${id}/`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );
            setIssue(
                response.data
            );
            if (
                response.data.assigned_to
            ) {
                setSelectedDeveloper(
                    String(
                        response.data.assigned_to
                    )
                );

            }

        } catch (error) {
            console.error(
                "Issue fetch error:",
                error
            );
            setMessage(
                "Failed to load issue."
            );
        } finally {

            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const token =localStorage.getItem("accessToken");
            const response =await axios.get(
                    `http://127.0.0.1:8000/api/comments/?issue=${id}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            setComments(response.data);
        } catch (error) {
            console.error(
                "Comments error:",
                error
            );
        }
    };
    const fetchDevelopers = async () => {
        try {
            const token =localStorage.getItem("accessToken");
            const response =await axios.get(
                    "http://127.0.0.1:8000/api/developers/",

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            setDevelopers(response.data);
        } catch (error) {
            console.error(
                "Developer fetch error:",
                error
            );
        }
    };


    useEffect(() => {
        if (!id) {
            return;
        }
        fetchIssue();
        fetchComments();

    }, [id]);

    useEffect(() => {
        if (
            user?.role === "ADMIN"
        ) {

            fetchDevelopers();
        }

    }, [user]);


    const assignDeveloper = async () => {
        if (!selectedDeveloper) {

            setMessage("Please select a developer.");
            return;
        }
        try {
            const token =localStorage.getItem("accessToken");
            await axios.patch(
                `http://127.0.0.1:8000/api/assign-developer/${id}/`,
                {
                    assigned_to:selectedDeveloper,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );
            setMessage(
                "Developer assigned successfully."
            );
            fetchIssue();
        } catch (error) {
            console.error(
                error
            );
            setMessage(
                error.response?.data?.detail ||
                "Failed to assign developer."
            );
        }
    };



    const changeStatus = async (newStatus) => {
        try {
            const token =localStorage.getItem("accessToken");
            await axios.patch(
                `http://127.0.0.1:8000/api/change-status/${id}/`,

                {
                    status: newStatus,
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setMessage("Status updated successfully.");
            fetchIssue();
        } catch (error) {
            console.error(
                error
            );

            setMessage(
                error.response?.data?.detail ||
                "Failed to change status."
            );
        }
    };



    const addComment = async () => {
        if (
            !newComment.trim()
        ) {

            setMessage(
                "Please write a comment."
            );
            return;
        }
        try {

            const token =localStorage.getItem("accessToken");
            await axios.post(
                "http://127.0.0.1:8000/api/comments/",

                {
                    issue: id,

                    comment:
                        newComment,
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setNewComment("");
            setMessage("Comment added successfully.");
            fetchComments();
        } catch (error) {
            console.error(
                error
            );

            setMessage(
                error.response?.data?.detail ||
                "Failed to add comment."
            );
        }
    };
    const logout = () => {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.push("/");
    };



    if (loading) {
        return (
            <div className="issue-details-loading">
                Loading issue...
            </div>
        );
    }
    if (!issue) {
        return (
            <div className="issue-details-loading">
                Issue not found.
            </div>
        );
    }
    return (

        <div className="issue-details-page">
            <div className="issue-details-navbar">
                <h2>TrackIt</h2>
                <div>
                    <button
                        className="issue-nav-button"
                        onClick={() => router.push(`/issuetracking/project/${issue.project}`)}>Back to Project</button>

                    <button
                        className="issue-logout-button"
                        onClick={logout}>Logout</button>
                </div>
            </div>

            <div className="issue-details-container">
                {message && (
                    <div className="issue-message">
                        {message}
                    </div>

                )}
                <div className="issue-main-card">
                    <div className="issue-top">
                        <div>
                            <span className="issue-id">
                                ISSUE #{issue.id}
                            </span>
                            <h1>
                                {issue.title}
                            </h1>
                        </div>
                    </div>


                    <div className="issue-description-box">
                        <h3>
                            Description
                        </h3>

                        <p>
                            {issue.description}
                        </p>

                    </div>



                    <div className="issue-info-grid">


                        <div className="issue-info-item">

                            <span>
                                Type
                            </span>

                            <strong>
                                {issue.issue_type}
                            </strong>

                        </div>


                        <div className="issue-info-item">

                            <span>
                                Priority
                            </span>

                            <strong>
                                {issue.priority}
                            </strong>

                        </div>


                        <div className="issue-info-item">

                            <span>
                                Status
                            </span>

                            <strong>
                                {issue.status}
                            </strong>

                        </div>


                        <div className="issue-info-item">

                            <span>
                                Reported By
                            </span>

                            <strong>
                                {issue.reported_by_name ||
                                    "Unknown"}
                            </strong>

                        </div>


                        <div className="issue-info-item">

                            <span>
                                Assigned To
                            </span>

                            <strong>
                                {issue.assigned_to_name ||
                                    "Not Assigned"}
                            </strong>

                        </div>

                    </div>

                </div>


                {user?.role === "ADMIN" && (

                    <div className="admin-controls">

                        <h2>
                            Admin Controls
                        </h2>
                        <div className="admin-control">

                            <label>
                                Assign Developer
                            </label>


                            <div className="admin-control-row">

                                <select
                                    value={selectedDeveloper}
                                    onChange={(e) =>setSelectedDeveloper(e.target.value)}>

                                    <option value="">
                                        Select Developer
                                    </option>


                                    {developers.map(
                                        (developer) => (
                                        <option
                                            key={developer.id}
                                            value={developer.id}>

                                            {
                                                developer.first_name
                                            }{" "}
                                            {
                                                developer.last_name
                                            }
                                        </option>
                                    ))}
                                </select>


                                <button
                                    onClick={assignDeveloper}>Assign
                                </button>

                            </div>

                        </div></div>)}
                    {(
                        user?.role === "ADMIN" ||
                        user?.role === "DEVELOPER"
                        ) && (
                        <div className="admin-control">

                            <label>
                                Change Status
                            </label>


                            <select
                                value={issue.status}
                                onChange={(e) =>changeStatus(e.target.value)}>

                                <option value="SUBMITTED">
                                    Submitted
                                </option>

                                <option value="IN_PROGRESS">
                                    In Progress
                                </option>

                                <option value="UNDER_REVIEW">
                                    Under Review
                                </option>

                                <option value="CLOSED">
                                    Closed
                                </option>

                            </select>
                        </div>)}
                <div className="comments-section">

                    <h2>
                        Comments
                    </h2>


                    {comments.length === 0 ? (

                        <div className="no-comments">
                            No comments yet.
                        </div>

                    ) : (

                        comments.map(
                            (comment) => (

                            <div
                                key={comment.id}
                                className="comment-card"
                            >

                                <div className="comment-header">

                                    <strong>
                                        {
                                            comment.user_name
                                        }
                                    </strong>


                                    <span>
                                        {
                                            new Date(
                                                comment.created_at).toLocaleString()
                                        }
                                    </span>

                                </div>


                                <p>
                                    {
                                        comment.comment
                                    }
                                </p>

                            </div>

                        ))

                    )}



                    {(
                        user?.role === "ADMIN" ||
                        user?.role === "DEVELOPER"
                    ) && (

                        <div className="comment-form">

                            <textarea
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) =>setNewComment(e.target.value)}/>
                            <button onClick={addComment}>Add Comment</button>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}