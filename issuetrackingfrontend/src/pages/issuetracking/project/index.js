import { useEffect, useState}  from "react";
import axios from "axios";
import { useRouter } from "next/router";


export default function Project() {

    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [message, setMessage] = useState("");
    const [role, setRole] = useState("");

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole); }, []);

    const fetchProjects = async () => {
        try {
            const token =localStorage.getItem("accessToken");
            const response = await axios.get(
                "http://127.0.0.1:8000/api/projects/",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );
            setProjects(response.data);

        } catch (error) {

            console.error(
                "Project fetch error:",
                error
            );
        }
    };


    useEffect(() => {fetchProjects();}, []);


    const createProject = async (e) => {
        e.preventDefault();
        setMessage("");
        try {

            const token =
                localStorage.getItem("accessToken");

            await axios.post(

                "http://127.0.0.1:8000/api/projects/",

                {
                    project_name: projectName,
                },

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            setMessage("Project created successfully!");
            setProjectName("");
            setShowForm(false);
            fetchProjects();

        } catch (error) {
            console.error(error);
            if (
                error.response?.status === 403
            ) {

                setMessage("Only Admin can create projects.");
            } else {

                setMessage("Failed to create project.");
            }
        }
    };


    const logout = () => {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        router.push("/");
    };



    return (

        <div className="project-page">
            <div className="project-navbar">
                <h2 className="project-logo">
                    TrackIT
                </h2>
                <div className="project-nav-right">

                    <button
                        className="project-logout-button"
                        onClick={logout}>Logout</button>
                </div>
            </div>

            <div className="project-container">
                <div className="project-header">
                    <h1 className="project-heading">
                        Projects
                    </h1>

                    {role === "ADMIN" && (
                        <button
                            className="project-create-button"
                            onClick={() => {setShowForm(!showForm);
                                setMessage("");}}>
                            {showForm
                                ? "Cancel"
                                : "+ Create Project"}
                        </button>
                    )}

                </div>
                {message && (

                    <div className="project-message">
                        {message}
                    </div>

                )}



                {showForm &&
                    role === "ADMIN" && (

                    <div className="project-form-card">

                        <h2>
                            Create Project
                        </h2>


                        <form
                            onSubmit={createProject}>
                            <label>
                                Project Name
                            </label>

                            <input
                                type="text"
                                placeholder="Example: Student Management System"
                                value={projectName}
                                onChange={(e) =>setProjectName(e.target.value)}required/>
                            <button
                                type="submit"
                                className="project-submit-button"
                            >
                                Create Project
                            </button>

                        </form>

                    </div>

                )}


                <div>

                    {projects.length === 0 ? (

                        <div className="project-empty">
                            <h3>
                                No Projects Found
                            </h3>

                            <p>
                                No projects have been
                                created yet.
                            </p>
                        </div>

                    ) : (

                        projects.map((project) => (

                            <div
                                key={project.id}
                                className="project-card"
                            >
                                    <div className="project-card-name">
                                        {project.project_name}
                                    </div>


                                <button
                                    className="project-view-button"
                                    onClick={() =>router.push(`/issuetracking/project/${project.id}`)
                                    }>View →</button>
                            </div>
                        ))
                    )}

                </div>

            </div>

        </div>
    );
}