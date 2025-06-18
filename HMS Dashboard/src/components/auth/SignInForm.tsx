import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { AuthContext } from "../../context/AuthContext";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Role } from "../../context/Role";

interface LoginRequest {
  username: string;
  password: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: Role;
  active: boolean;
}

interface AuthResponse {
  tokenPair: TokenPair;
  user: User;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password } as LoginRequest),
      });
      const data: AuthResponse = await response.json();
      if (response.ok) {
        const tokens: TokenPair = {
          accessToken: data.tokenPair.accessToken,
          refreshToken: data.tokenPair.refreshToken,
        };
        const userData: User = data.user;
        const loginSuccess = login(tokens, userData);
        if (loginSuccess) {
          navigate('/');
        } else {
          toast.error("Login failed: Access denied for CUSTOMER role");
        }
      } else {
        console.error("Đăng nhập thất bại:", data);
        toast.error("Login failed: Invalid credentials");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API đăng nhập:", error);
      toast.error("Login failed due to a network error");
    }
  };

  const handleButtonClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username and password to sign in!
            </p>
          </div>
          <div>
            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Username <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleButtonClick}
                    className="w-full"
                    disabled={!username || !password}
                  >
                    Sign in
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}