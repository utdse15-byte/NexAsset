import type { CSSProperties } from "react";
import bgImg from "@/assets/images/background/banner-1.png";
import Character from "@/assets/images/characters/character_3.png";
import { Icon } from "@/components/icon";
import { GLOBAL_CONFIG } from "@/global-config";
import { Button } from "@/ui/button";
import { Text, Title } from "@/ui/typography";

export default function BannerCard() {
	const bgStyle: CSSProperties = {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundImage: `url("${bgImg}")`,
		backgroundSize: "cover",
		backgroundPosition: "center",
		backgroundRepeat: "no-repeat",
		opacity: 0.3,
		mixBlendMode: "overlay",
	};

	return (
		<div className="relative bg-gradient-to-r from-primary to-primary/80 rounded-2xl overflow-hidden shadow-lg">
			<div style={bgStyle} className="z-0 pointer-events-none" />
			<div className="p-8 z-10 relative">
				<div className="grid grid-cols-12 gap-6 items-center">
					<div className="col-span-12 md:col-span-7 lg:col-span-8">
						<div className="flex flex-col gap-6">
							<div>
								<Title as="h2" className="text-3xl md:text-4xl font-bold text-white mb-2">
									Welcome back to {GLOBAL_CONFIG.appName}
								</Title>
								<Text className="text-white/90 text-lg max-w-xl leading-relaxed">
									The brand new User Interface with power of Shadcn/ui Components. Explore the endless possibilities.
								</Text>
							</div>

							<div className="flex flex-wrap gap-4">
								<Button
									variant="secondary"
									size="lg"
									className="bg-white text-primary hover:bg-white/90 font-bold shadow-md"
									onClick={() => window.open("https://discord.com")}
								>
									<Icon icon="carbon:logo-discord" size={20} className="mr-2" />
									Join Discord
								</Button>
								<Button
									variant="outline"
									size="lg"
									className="border-white/40 text-white bg-white/5 hover:bg-white/20 hover:text-white backdrop-blur-sm"
								>
									Documentation
								</Button>
							</div>
						</div>
					</div>

					<div className="col-span-12 md:col-span-5 lg:col-span-4 hidden md:block">
						<div className="relative h-full min-h-[200px] flex items-center justify-center">
							<img
								src={Character}
								className="absolute bottom-[-40px] right-0 w-64 h-auto drop-shadow-2xl transition-transform hover:scale-105 duration-500"
								alt="character"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
