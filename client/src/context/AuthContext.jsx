import {
    createContext,
    useEffect,
    useState
} from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({children})=>{
    const [user,setUser]=useState(null);
    const [token,setToken]=useState(null);
    const [loading,setLoading]=useState(null);

    useEffect(()=>{
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if(savedToken&&savedUser){
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    },[]);
    const login = (userData,userToken)=>{
        setUser(userData);
        setToken(userToken);

        localStorage.setItem("token",userToken);
        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );
    };
    const logout=()=>{
        setUser(null);
        setToken(null);

        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };
    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated:Boolean(token)
    };
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
