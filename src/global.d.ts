/// <reference types="@sveltejs/kit" />
/// <reference types="vite-plugin-pwa/info.d.ts" />
/// <reference types="vite-plugin-pwa/client.d.ts" />

declare module 'virtual:pwa-info' {
	export interface PwaInfo {
		webManifest: {
			linkTag: string;
		};
	}

	export const pwaInfo: PwaInfo | undefined;
}

declare module 'virtual:pwa-register' {
	export interface RegisterSWOptions {
		immediate?: boolean;
		onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
		onRegisterError?: (error: unknown) => void;
	}

	export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}
