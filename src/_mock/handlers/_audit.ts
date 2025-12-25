import { HttpResponse, http } from "msw";
import { auditManager } from "@/_mock/utils";
import { ResultStatus } from "@/types/enum";

const getAuditLogs = http.get("/api/audit/logs", async () => {
	try {
		const logs = auditManager.get() || [];

		if (Array.isArray(logs)) {
			// Filter out invalid logs
			const validLogs = logs?.filter((log) => log?.timestamp);
			// Sort by timestamp desc
			validLogs?.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

			return HttpResponse.json(
				{
					status: ResultStatus.SUCCESS,
					message: "",
					data: validLogs,
				},
				{
					status: 200,
				},
			);
		}
		return HttpResponse.json({ status: ResultStatus.SUCCESS, data: [] });
	} catch (error) {
		console.error("Audit Logs Error:", error);
		return HttpResponse.json(
			{ status: ResultStatus.SUCCESS, message: "Failed to fetch logs (Recovered)", data: [] },
			{ status: 200 },
		);
	}
});

const getAuditStats = http.get("/api/audit/stats", async () => {
	try {
		const logs = auditManager.get() || [];

		if (!Array.isArray(logs)) {
			return HttpResponse.json(
				{
					status: ResultStatus.SUCCESS,
					message: "",
					data: {
						total_events: 0,
						critical_risks: 0,
						active_users: 0,
						compliance_rate: 100,
					},
				},
				{
					status: 200,
				},
			);
		}

		const validLogs = logs?.filter((log) => log && log.risk_score !== undefined && log.actor);
		const total_events = validLogs?.length || 0;
		const critical_risks = validLogs?.filter((log) => log.risk_score > 70).length || 0;
		const active_users = new Set(validLogs?.map((log) => log.actor.email)).size || 0;
		const compliance_rate = total_events > 0 ? Math.round(((total_events - critical_risks) / total_events) * 100) : 100;

		return HttpResponse.json(
			{
				status: ResultStatus.SUCCESS,
				message: "",
				data: {
					total_events,
					critical_risks,
					active_users,
					compliance_rate,
				},
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error("Audit Stats Error:", error);
		return HttpResponse.json(
			{
				status: ResultStatus.SUCCESS,
				message: "Failed to fetch stats (Recovered)",
				data: {
					total_events: 0,
					critical_risks: 0,
					active_users: 0,
					compliance_rate: 100,
				},
			},
			{ status: 200 },
		);
	}
});

export { getAuditLogs, getAuditStats };
