import './styles.css';

function App({ Component, pageProps }) {
    return (
        <div className="bg-slate-900 min-h-screen">
            <Component {...pageProps} />
        </div>)
}
export default App;
