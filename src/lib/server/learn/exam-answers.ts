import type { Database } from "$lib/server/learn/store";
import type { Exam } from "$lib/server/learn/exams";

type AnswerRow = {
  question: number;
  choice: number;
};

export async function readExamAnswers(
  db: Database | undefined,
  exam: Exam,
): Promise<number[]> {
  if (!db) throw new Error("The exam database is unavailable.");

  const rows = await db
    .prepare(
      `select question, choice from exam_answers
       where exam = ? order by question`,
    )
    .bind(exam.id)
    .all<AnswerRow>();

  if (rows.results.length !== exam.questions.length) {
    throw new Error("The exam answer set is incomplete.");
  }

  return rows.results.map((row, index) => {
    const choices = exam.questions[index]?.choices.length ?? 0;
    if (
      row.question !== index ||
      !Number.isInteger(row.choice) ||
      row.choice < 0 ||
      row.choice >= choices
    ) {
      throw new Error("The exam answer set is invalid.");
    }
    return row.choice;
  });
}
