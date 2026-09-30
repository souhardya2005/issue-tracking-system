import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function ProjectIssues() {

    const router = useRouter();
    const { id } = router.query;
    const [issues, setIssues] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [issueType, setIssueType] =useState("BUG");
    const [priority, setPriority] =useState("MEDIUM");
    const [message, setMessage] =useState("");
    const [user, setUser] = useState(null);
    const [developers, setDevelopers] =useState([]);
    const [comments, setComments] =useState({});
    const [commentText, setCommentText] =useState({});

    const fetchProject = async () => {
        try {
            const token =localStorage.getItem("accessToken");
            const response = await axios.get(
                `http://127.0.0.1:8000/api/projects/${id}/`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );
            setProject(response.data);
        } catch (error) {
            console.error("Project error:",error);
        }
    };
    const fetchIssues = async () => {
        try {
            const token =localStorage.getItem("accessToken");
            const response = await axios.get(
                "http://127.0.0.1:8000/api/issues/",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const projectIssues =response.data.filter((issue) =>String(issue.project) ===String(id));
            setIssues(projectIssues);
        } catch (error) {
            console.error("Issue error:",error);
        } finally {
            setLoading(false);
        }
    };
    const fetchComments = async () => {
        try {
            const token =localStorage.getItem("accessToken");

            const response = await axios.get(
                "http://127.0.0.1:8000/api/comments/",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );
            const groupedComments = {};
            response.data.forEach(
                (comment) => {const issueId =comment.issue;
                    if (!groupedComments[issueId]){
                        groupedComments[issueId] =[];
                    }
                    groupedComments[issueId].push(comment);
                });
            setComments(groupedComments);
        } catch (error) {
            console.error("Comment fetch error:",error.response?.data || error);
        }
    };

    useEffect(() => {
        const storedUser =localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("User parsing error:",error);
            }
        }}, []);
    useEffect(() => {
        if (!user) {
            return;
        }
        if (user.role !== "ADMIN") {
            return;
        }
        const fetchDevelopers = async () => {
            try {
                const token =localStorage.getItem("accessToken");
                const response = await axios.get(
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
                console.error("Developer fetch error:",error.response?.data || error);
            }
        };
        fetchDevelopers();}, [user]);
    useEffect(() => {
        if (!id) {
            return;
        }
        fetchProject();
        fetchIssues();
        fetchComments();
    }, [id]);

    const createIssue = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const token =localStorage.getItem("accessToken");
            await axios.post(
                "http://127.0.0.1:8000/api/issues/",
                {
                    project: id,
                    title: title,
                    description: description,
                    issue_type: issueType,
                    priority: priority,
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );


            setMessage("Issue created successfully!");
            setTitle("");
            setDescription("");
            setIssueType("BUG");
            setPriority("MEDIUM");
            setShowForm(false);
            fetchIssues();
        } catch (error) {
            console.error("Create issue error:",error);
            if (error.response?.data) {
                setMessage(JSON.stringify(error.response.data));
            } else {
                setMessage("Failed to create issue.");
            }
        }
    };
    const handleAssignDeveloper = async (issueId,developerId) => {
        if (!developerId) {
            return;
        }
        try {
            const token =localStorage.getItem("accessToken");
            await axios.patch(
                `http://127.0.0.1:8000/api/assign-developer/${issueId}/`,
                {
                    assigned_to:
                        developerId,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );
            fetchIssues();
        } catch (error) {
            console.error(
                "Assignment error:",
                error.response?.data || error
            );
        }
    };

    const handleStatusChange = async (issueId,newStatus) => {
        try {
            const token =localStorage.getItem("accessToken");
            await axios.patch(
                `http://127.0.0.1:8000/api/change-status/${issueId}/`,
                {
                    status:
                        newStatus,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );
            fetchIssues();
        } catch (error) {
            console.error(
                "Status update error:",
                error.response?.data || error
            );
        }
    };

    const addComment = async (issueId) => {
        const text =commentText[issueId]?.trim();
        if (!text) {
            return;
        }
        try {
            const token =localStorage.getItem("accessToken");
            await axios.post(
                "http://127.0.0.1:8000/api/comments/",
                {
                    issue: issueId,
                    comment: text,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );
            setCommentText((previous) => ({...previous,[issueId]:"",}));
            fetchComments();
        } catch (error) {
            console.error(
                "Add comment error:",
                error.response?.data || error
            );
        }
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        router.push("/");
    };
    return (

        <div className="issues-page">
            <div className="issues-navbar">
                <h2 className="issues-logo">TrackIT</h2>
                <div className="issues-nav-right">
                    <button
                        className="issues-nav-button"
                        onClick={() =>router.push("/issuetracking/project")}>Projects</button>
                    <button
                        className="issues-logout-button"
                        onClick={logout}>Logout</button>
                </div></div>
            <div className="issues-container">
                <div className="issues-header">
                    <div>
                        <p className="issues-project-id">{project?.project_id}</p>
                        <h1 className="issues-heading">{project?.project_name}</h1>
                        <p className="issues-subtitle">Issues</p>
                    </div>
                    <button
                        className="issues-create-button"
                        onClick={() => {setShowForm(!showForm);setMessage("");}}>
                        {showForm
                            ? "Cancel"
                            : "+ Create Issue"}
                    </button>
                </div>
                {message && (<div className="issues-message">{message}</div>)}
                {showForm && (
                    <div className="issues-form-card">
                        <h2>Create Issue</h2>
                        <form onSubmit={createIssue}>
                            <label>Issue Title</label>
                            <input
                                type="text"
                                placeholder="Enter issue title"
                                value={title}
                                onChange={(e) =>setTitle(e.target.value)}required/>
                            <label>Description</label>
                            <textarea
                                placeholder="Describe the issue"
                                value={description}
                                onChange={(e) =>setDescription(e.target.value)}required/>
                            <label>Issue Type</label>
                            <select value={issueType}
                                onChange={(e) =>setIssueType(e.target.value)}>
                                <option value="BUG">Bug</option>
                                <option value="FEATURE">Feature</option>
                                <option value="TASK">Task</option>
                            </select>

                            <label>Priority</label>
                            <select
                                value={priority}
                                onChange={(e) =>setPriority(e.target.value)}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="CRITICAL">Critical</option>
                            </select>

                            <button
                                type="submit"
                                className="issues-submit-button">Create Issue</button>
                        </form></div>)}
                {loading ? (
                    <p className="issues-loading">
                        Loading issues...
                    </p>
                ) : issues.length === 0 ? (
                    <div className="issues-empty">
                        <h3>No Issues Found</h3>
                        <p>
                            This project does not
                            have any issues yet.
                        </p>
                    </div>
                ) : (
                    <div>
                        {issues.map(
                            (issue) => (
                                <div
                                    key={issue.id}
                                    className="issue-card">
                                    <div className="issue-card-content">
                                        <h2 className="issue-title">
                                            {issue.title}</h2>
                                        <p className="issue-description">
                                            {issue.description}
                                        </p>

                                        <div className="issue-details">
                                            <span>
                                                <b>Type:</b>{" "}
                                                {issue.issue_type}
                                            </span>
                                            <span>
                                                <b>Priority:</b>{" "}
                                                {issue.priority}
                                            </span>
                                            <span>
                                                <b> Status:</b>{" "}
                                                {issue.status}
                                            </span>
                                        </div>
                                        <div className="issue-people">
                                            <span>
                                                <b>Reported By: </b>{" "}
                                                {issue.reported_by_name ||"Unknown"}
                                            </span>
                                            <span>
                                                <b>Assigned To:</b>{" "}
                                                {issue.assigned_to_name ||"Not Assigned"}
                                            </span>
                                        </div>
                                        {user?.role === "ADMIN"  || user?.role === "DEVELOPER" && (
                                            <div className="admin-issue-controls">
                                                <div className="admin-control">
                                                    <label>Change Status</label>
                                                    <select
                                                        value={issue.status || ""}
                                                        onChange={(e) =>handleStatusChange(issue.id,e.target.value)}>
                                                        <option value="SUBMITTED">SUBMITTED</option>
                                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                                        <option value="UNDER_REVIEW">UNDER REVIEW</option>
                                                        <option value="CLOSED">CLOSED</option>
                                                    </select>
                                                </div></div>)}
                                            {user?.role === "ADMIN" && (
                                                <div className="admin-control">
                                                    <label>Assign Developer</label>
                                                    <select
                                                        value={issue.assigned_to || ""}
                                                        onChange={(e) =>handleAssignDeveloper(issue.id,e.target.value)}>
                                                        <option value="">Select Developer</option>
                                                        {developers.map(
                                                            (developer) => (
                                                                <option
                                                                    key={
                                                                        developer.id
                                                                    }
                                                                    value={
                                                                        developer.id
                                                                    }>
                                                                    {
                                                                        developer.first_name
                                                                    }{" "}

                                                                    {
                                                                        developer.last_name
                                                                    }
                                                                </option>
                                                            )
                                                        )}

                                                    </select>

                                                </div>
                                        )}
                                        <div className="issue-comments">
                                            <h3 className="comments-heading">Comments</h3>
                                            {comments[issue.id]?.length > 0 ? (
                                                <div className="comments-list">
                                                    {comments[
                                                        issue.id
                                                    ].map(
                                                        (comment) => (
                                                            <div
                                                                key={
                                                                    comment.id
                                                                }
                                                                className="comment-card"
                                                            >
                                                                <div className="comment-header">
                                                                    <strong>
                                                                        {
                                                                            comment.user_name ||
                                                                            "User"
                                                                        }
                                                                    </strong>
                                                                    <span>

                                                                        {
                                                                            comment.created_at? new Date(comment.created_at).toLocaleString(): ""
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <p>
                                                                    {
                                                                        comment.comment
                                                                    }
                                                                </p>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ) : (

                                                <p className="no-comments">
                                                    No comments yet.
                                                </p>
                                            )}

                                            {(user?.role === "ADMIN" ||
                                                user?.role === "DEVELOPER") && (

                                                <div className="add-comment">
                                                    <textarea
                                                        placeholder="Write a comment..."
                                                        value={
                                                            commentText[
                                                                issue.id
                                                            ] || ""
                                                        }
                                                        onChange={(e) =>setCommentText((previous) => ({...previous,[issue.id]:e.target.value,}))}/>
                                                    <button
                                                        type="button"onClick={() =>addComment(issue.id)}>Add Comment</button>
                                                </div>)}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}