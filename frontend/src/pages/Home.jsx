import { useNavigate } from "react-router-dom";
function Home(){
    const navigate = useNavigate();
    return(
        <>
        <main className="hero">
            <div className="hero-content">
                <h1>Stop waiting in line.</h1>
                <h2>Start using your time.</h2>
                <p>Join queues digitally, track your position in real time, and know exactly when it's your turn.</p>
                <div className="hero-buttons">
                    <button onClick={() => navigate("/services")}>Join a Queue</button>
                    <button onClick={() => {
                        document.querySelector(".how-it-works").scrollIntoView({
                            behaviour: "smooth"
                        });
                    }}>How it Works</button>
                </div>
            </div>
            <div className="ticket-preview">
                <p>Your Token</p>
                <h2>Q35</h2>
                <p>Currently serving: Q27</p>
                <p>8 people ahead</p>
                <strong>Estimated wait: 24 min</strong>
                <span className="preview-status">.Waiting</span>
            </div>
        </main>
        <section className="how-it-works">
            <h2>How SmartQ Works</h2>
            <p className="section-description">Join a queue digitally and spend your waiting time doing what matters.</p>
            <div className="steps">
                <div className="step">
                    <div className="step-number">
                        1
                    </div>
                    <h3>Find a service</h3>
                    <p>Choose the services you want from available queues.</p>
                </div>
                <div className="step">
                    <div className="step-number">2</div>
                    <h3>Join the Queue</h3>
                    <p>Get a digital token without standing in a physical Line.</p>
                </div>
                   <div className="step">
                    <div className="step-number">3</div>
                    <h3>Track your Token</h3>
                    <p>Follow your position and estimated waiting time.</p>
                </div>
                   <div className="step">
                    <div className="step-number">4</div>
                    <h3>Get Served</h3>
                    <p>Receive an alert when your turn is approaching.</p>
                </div>

            </div>
        </section>
        <section className="features">
            <h2>Why SmartQ?</h2>
            <p className="section-description">
                A smarter way to manage waiting time.
            </p>
            <div className="feature-grid">
                <div className="feature-card">
                    <div className="feature-icon">💥</div>
                    <h3>Real-Time Updates</h3>
                    <p>
                        See your queue position change instantly without refreshing the page.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">💾</div>
                    <h3>Digital Tokens</h3>
                    <p>
                       Get a digital token and avoid standing in aphysical queue.
                    </p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🔔</div>
                    <h3>Smart  Notifications</h3>
                    <p>
                        Organizations can understand queue activity and waiting times.
                    </p>
                </div>

            </div>
        </section>
        </>
    );
}
export default Home;
