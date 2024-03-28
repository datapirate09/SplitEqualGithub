import React,{useEffect} from "react";
import Header from "./Header.jsx";
import Title from "./Title.jsx";
import LoginOption from "./LoginOption.jsx";
import Feature from "./Feature.jsx";
import Footer from "./Footer.jsx";
function App(){
    useEffect(() => {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("section_para--visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        const paras = document.querySelectorAll(".section_para");
        paras.forEach((para) => {
            observer.observe(para);
        });

        // Cleanup function to disconnect the observer when the component unmounts
        return () => {
            paras.forEach((para) => {
                observer.unobserve(para);
            });
        };
    }, []);
    return (
        <div>
            <div class="homepage-content">
                <Header />
                <Title heading="SplitEqual" subheading="All Your Expenses in One Place" />
                <LoginOption />
            </div>
            <div class="purpose">
                <h1 id="purpose-head" className="section_para">SplitPurpose</h1>
                <p className="purpose-content section_para">Planning a trip with friends or family? SplitEqual allows you to 
                keep a track of your group expenses and helps clear dues, redeem amount instantly. Create an account to access 
                the premium features specially crafted for our members.</p>
            </div>
            <Feature />
            <Footer />
        </div>
        
        
    )
}
export default App;

