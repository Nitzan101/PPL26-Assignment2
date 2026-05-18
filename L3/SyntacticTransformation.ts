import { Binding, ClassExp, ProcExp, Exp, Program, makeProcExp, makeIfExp, VarDecl, makeVarDecl, makeBoolExp, makeAppExp, makePrimOp, makeVarRef, makeLitExp, CExp } from "./L3-ast";
import { Result, makeFailure } from "../shared/result";
import { makeSymbolSExp } from "./L3-value";

/*
Purpose: Transform ClassExp to ProcExp
Signature: class2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp => {
    const makeIfs = (methods: Binding[]): CExp => 
        methods.length === 0 ? 
            makeBoolExp(false) : 
            makeIfExp(
                makeAppExp(makePrimOp("eq?"), [
                    makeVarRef("msg"), 
                    makeLitExp(makeSymbolSExp(methods[0].var.var))
                ]),
                methods[0].val,
                makeIfs(methods.slice(1))
            );

    return makeProcExp(
        exp.fields, 
        [makeProcExp([makeVarDecl("msg")], [makeIfs(exp.methods)])]
    );
};
/*
Purpose: Transform all class forms in the given AST to procs
Signature: transform(AST)
Type: [Exp | Program] => Result<Exp | Program>
*/

export const transform = (exp: Exp | Program): Result<Exp | Program> =>
    //@TODO
    makeFailure("ToDo");
