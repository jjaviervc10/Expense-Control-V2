
export type Expense = {
  id: string
  expenseName: string
  amount: number
  category: string
  date: Date
  range: ReportRange        // ✅ CLAVE
  favorito?: boolean        // ✅ Para sistema de plantillas
}


export type DraftExpense = Omit<Expense, 'id'>

type ValuePiece = Date | null;

export type Value = ValuePiece | [ValuePiece, ValuePiece];
 export type Category = {
    id : string
    name : string
    icon : string
 }

 // 🔹 nuevo
export type ReportRange = 'diario' | 'semanal' | 'mensual'

