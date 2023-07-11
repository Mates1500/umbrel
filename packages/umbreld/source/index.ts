import ms from 'ms'

import packageJson from '../package.json' assert {type: 'json'}

import createLogger from './utilities/logger.js'

import {type ServiceConstructor} from './services/umbrel-service.js'
import type UmbrelService from './services/umbrel-service.js'
import * as services from './services/index.js'

const {Store, Server} = services

type UmbreldOptions = {
	dataDirectory: string
	port?: number
	logLevel?: string
}

export default class Umbreld {
	version = packageJson.version
	dataDirectory: string
	port: number
	logLevel: string
	logger: ReturnType<typeof createLogger>
	services: Record<string, UmbrelService>

	constructor({dataDirectory, port = 80, logLevel = 'normal'}: UmbreldOptions) {
		this.dataDirectory = dataDirectory
		this.port = port
		this.logLevel = logLevel
		this.logger = createLogger('umbreld', this.logLevel)
		this.services = {}
	}

	async start() {
		this.logger.log(`☂️  Starting Umbrel v${this.version}`)
		this.logger.log()
		this.logger.log(`dataDirectory: ${this.dataDirectory}`)
		this.logger.log(`port:          ${this.port}`)
		this.logger.log(`logLevel:      ${this.logLevel}`)
		this.logger.log()

		// Load the store service before any other services
		await this.loadService(Store)

		// Load all services apart from Store and Server
		await Promise.all(
			Object.values(services)
				.filter((Service) => ![Store, Server].includes(Service))
				.map((Service) => this.loadService(Service)),
		)

		// Load the server service once all other services are loaded
		await this.loadService(Server)
	}

	async loadService(UmbrelService: ServiceConstructor) {
		const start = Date.now()
		const {name} = UmbrelService
		this.logger.verbose(`Loading service: ${name}`)
		// Create a new instance of the service
		const service = new UmbrelService({umbreld: this})

		// Wait for it to start
		await service.start()
		const loadTime = ms(Date.now() - start)
		this.logger.verbose(`Loaded service ${name} in ${loadTime}`)

		// Expose it on the umbreld instance via it's identifier
		this.services[name.toLowerCase()] = service

		return service
	}
}