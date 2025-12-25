import { Navigate } from "react-router";
import LocalePicker from "@/components/locale-picker";
import Logo from "@/components/logo";
import { GLOBAL_CONFIG } from "@/global-config";
import SettingButton from "@/layouts/components/setting-button";
import { useUserToken } from "@/store/userStore";
import LoginForm from "./login-form";
import MobileForm from "./mobile-form";
import { LoginProvider } from "./providers/login-provider";
import QrCodeFrom from "./qrcode-form";
import RegisterForm from "./register-form";
import ResetForm from "./reset-form";

function LoginPage() {
	const token = useUserToken();

	if (token.accessToken) {
		return <Navigate to={GLOBAL_CONFIG.defaultRoute} replace />;
	}

	return (
		<div className="relative flex items-center justify-center min-h-svh bg-background bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-background to-background dark:from-indigo-950 dark:via-background dark:to-background">
			<div className="glass rounded-3xl p-8 md:p-12 w-full max-w-lg shadow-2xl border border-white/20 dark:border-white/10 relative z-10">
				<div className="flex justify-center gap-2 mb-8">
					<div className="flex items-center gap-2 font-medium cursor-pointer text-2xl">
						<Logo size={32} />
						<span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-600 dark:to-indigo-400">
							{GLOBAL_CONFIG.appName}
						</span>
					</div>
				</div>

				<div className="w-full">
					<LoginProvider>
						<LoginForm />
						<MobileForm />
						<QrCodeFrom />
						<RegisterForm />
						<ResetForm />
					</LoginProvider>
				</div>
			</div>

			<div className="absolute right-4 top-4 flex flex-row gap-2">
				<LocalePicker />
				<SettingButton />
			</div>
		</div>
	);
}
export default LoginPage;
