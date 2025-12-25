import { faker } from "@faker-js/faker";

export const fakeAvatars = (count: number) => {
	const result: string[] = [];
	for (let index = 0; index < count; index += 1) {
		result.push(faker.image.avatarGitHub());
	}
	return result;
};
export class MockDataManager<T> {
	private key: string;
	private defaultData: T[];

	constructor(key: string, defaultData: T[]) {
		this.key = `mock_v5_${key}`;
		this.defaultData = defaultData;
		this.init();
	}

	private init() {
		try {
			const stored = localStorage.getItem(this.key);
			if (!stored) {
				localStorage.setItem(this.key, JSON.stringify(this.defaultData));
			}
		} catch (error) {
			console.error(`MockDataManager: Failed to init data for key "${this.key}"`, error);
		}
	}

	get(): T[] {
		try {
			const stored = localStorage.getItem(this.key);
			return stored ? JSON.parse(stored) : this.defaultData;
		} catch (error) {
			console.error(`MockDataManager: Failed to load data for key "${this.key}"`, error);
			return this.defaultData;
		}
	}

	set(data: T[]) {
		try {
			localStorage.setItem(this.key, JSON.stringify(data));
		} catch (error) {
			console.error(`MockDataManager: Failed to save data for key "${this.key}"`, error);
		}
	}

	// Helper to update a single item
	update(id: string, updater: (item: T) => T) {
		const data = this.get();
		const index = data.findIndex((item: any) => item.id === id);
		if (index !== -1) {
			data[index] = updater(data[index]);
			this.set(data);
			return data[index];
		}
		return null;
	}

	// Helper to add an item
	add(item: T) {
		const data = this.get();
		data.unshift(item);
		this.set(data);
		return item;
	}

	// Helper to delete an item
	delete(id: string) {
		const data = this.get();
		const index = data.findIndex((item: any) => item.id === id);
		if (index !== -1) {
			data.splice(index, 1);
			this.set(data);
			return true;
		}
		return false;
	}

	// Helper to find an item
	find(predicate: (item: T) => boolean) {
		const data = this.get();
		return data.find(predicate);
	}
}

export interface AuditLog {
	id: string;
	timestamp: string;
	actor: {
		name: string;
		email: string;
		avatar: string;
		ip: string;
		location: string;
	};
	action: string;
	target: string;
	status: "success" | "failure" | "warning";
	risk_score: number;
	details: any;
	user_agent: string;
}

export const auditManager = new MockDataManager<AuditLog>(
	"audit_logs",
	Array.from({ length: 50 }).map(() => ({
		id: faker.string.uuid(),
		timestamp: faker.date.recent({ days: 30 }).toISOString(),
		actor: {
			name: faker.person.fullName(),
			email: faker.internet.email(),
			avatar: faker.image.avatarGitHub(),
			ip: faker.internet.ipv4(),
			location: `${faker.location.city()}, ${faker.location.country()}`,
		},
		action: faker.helpers.arrayElement([
			"User Login",
			"View Asset",
			"Update Asset",
			"Create Asset",
			"Delete Asset",
			"Export Report",
			"System Config",
		]),
		target: faker.commerce.productName(),
		status: faker.helpers.arrayElement(["success", "failure", "warning"]) as "success" | "failure" | "warning",
		risk_score: faker.number.int({ min: 0, max: 100 }),
		details: {
			method: faker.internet.httpMethod(),
			path: faker.system.filePath(),
		},
		user_agent: faker.internet.userAgent(),
	})),
);

export const logAudit = (
	action: string,
	target: string,
	details: any,
	status: "success" | "failure" | "warning" = "success",
) => {
	const log: AuditLog = {
		id: faker.string.uuid(),
		timestamp: new Date().toISOString(),
		actor: {
			name: "Admin User", // Mock current user
			email: "admin@example.com",
			avatar: faker.image.avatarGitHub(),
			ip: faker.internet.ipv4(),
			location: `${faker.location.city()}, ${faker.location.country()}`,
		},
		action,
		target,
		status,
		risk_score: faker.number.int({ min: 0, max: 100 }), // Mock risk score
		details,
		user_agent: faker.internet.userAgent(),
	};
	auditManager.add(log);
	return log;
};
