declare global {
	namespace App {
		interface Platform {
			env?: {
				/** D1 database behind /learn/account. Absent until it is bound. */
				LEARN_DB?: import('$lib/server/learn/store').Database;
			};
		}
	}
}

export { };
