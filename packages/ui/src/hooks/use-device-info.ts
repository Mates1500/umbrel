import {hostEnvironmentMap, LOADING_DASH, UmbrelHostEnvironment, UNKNOWN} from '@/constants'
import {RouterOutput, trpcReact} from '@/trpc/trpc'

type UiHostInfo = {
	icon?: string
	title: string
}

type DeviceInfoT =
	| {
			isLoading: true
			data: undefined
			uiData: UiHostInfo
	  }
	| {
			isLoading: false
			data: {
				umbrelHostEnvironment?: UmbrelHostEnvironment
				device?: string
				modelNumber?: string
				serialNumber?: string
				osVersion?: string
			}
			uiData: UiHostInfo
	  }

export function useDeviceInfo(): DeviceInfoT {
	const osQ = trpcReact.system.version.useQuery()
	const deviceInfoQ = trpcReact.system.device.useQuery()

	const isLoading = osQ.isLoading || deviceInfoQ.isLoading
	if (isLoading) {
		return {
			isLoading: true,
			data: undefined,
			uiData: {
				icon: undefined,
				title: LOADING_DASH,
			},
		} as const
	}

	const umbrelHostEnvironment: UmbrelHostEnvironment | undefined = deviceInfoToHostEnvironment(deviceInfoQ.data)

	const device = deviceInfoQ.data?.device
	const modelNumber = deviceInfoQ.data?.model
	const serialNumber = deviceInfoQ.data?.serial
	const osVersion = osQ.data

	return {
		isLoading,
		data: {
			umbrelHostEnvironment,
			device,
			modelNumber,
			serialNumber,
			osVersion,
		},
		uiData: umbrelHostEnvironment
			? {
					icon: hostEnvironmentMap[umbrelHostEnvironment].icon,
					title: device || LOADING_DASH,
			  }
			: {
					icon: undefined,
					title: UNKNOWN(),
			  },
	}
}

type DeviceInfo = RouterOutput['system']['device']

function deviceInfoToHostEnvironment(deviceInfo?: DeviceInfo): UmbrelHostEnvironment | undefined {
	if (!deviceInfo) {
		return undefined
	}

	if (deviceInfo.device.toLowerCase().includes('umbrel home')) {
		return 'umbrel-home'
	}

	if (deviceInfo.device.toLowerCase().includes('raspberry pi')) {
		return 'raspberry-pi'
	}

	// Assume Linux
	return 'linux'
}
