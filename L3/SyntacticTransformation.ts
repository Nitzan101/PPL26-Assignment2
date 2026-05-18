import { Binding, ClassExp, ProcExp, Exp, Program, CExp,makeProcExp, makeVarDecl, makeBoolExp, makeIfExp, makeAppExp, makePrimOp, makeVarRef, makeLitExp, makeProgram, makeDefineExp, makeBinding,isProgram, isDefineExp, isAtomicExp, isLitExp, isIfExp, isAppExp, isProcExp, isLetExp, isClassExp, makeLetExp 
} from "./L3-ast";
import { Result, bind, makeFailure, makeOk, mapResult } from "../shared/result";
import { isClass, makeSymbolSExp } from "./L3-value";
import { is, map } from "ramda";
import { todo } from "node:test";

/*
Purpose: Transform ClassExp to ProcExp
Signature: class2proc(classExp)
Type: ClassExp => ProcExp
*/
export const class2proc = (exp: ClassExp): ProcExp => {
    const makeIfs = (methods: Binding[]): CExp => {
        if (methods.length === 0) {
            return makeLitExp(makeSymbolSExp("error"));
        }

        const methodVal = methods[0].val;
        
        // Extract the body of the lambda since methods are assumed to be zero-parameter procedures
        const returnExp = isProcExp(methodVal) ? methodVal.body[0] : methodVal;

        return makeIfExp(
            makeAppExp(makePrimOp("eq?"), [
                makeVarRef("msg"), 
                makeLitExp(makeSymbolSExp(methods[0].var.var))
            ]),
            returnExp,
            makeIfs(methods.slice(1))
        );
    };

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
    isProgram(exp) ? bind(mapResult(transformExp, exp.exps), (exps: Exp[]) => makeOk(makeProgram(exps))) :
    transformExp(exp);

const transformExp = (exp: Exp): Result<Exp> =>
    isDefineExp(exp) ? bind(transformCExp(exp.val), (val: CExp) => makeOk(makeDefineExp(exp.var, val))) :
    transformCExp(exp);

const transformCExp = (exp: CExp): Result<CExp> =>
    isAtomicExp(exp) ? makeOk(exp) :
    isLitExp(exp) ? makeOk(exp) :
    isIfExp(exp) ? bind(transformCExp(exp.test), test =>
                    bind(transformCExp(exp.then), then =>
                        bind(transformCExp(exp.alt), alt =>
                            makeOk(makeIfExp(test, then, alt))))) :
    isAppExp(exp) ? bind(transformCExp(exp.rator), rator =>
                        bind(mapResult(transformCExp, exp.rands), rands =>
                            makeOk(makeAppExp(rator, rands)))) :
    isProcExp(exp) ? bind(mapResult(transformCExp, exp.body), body =>
                        makeOk(makeProcExp(exp.args, body))) :
    isLetExp(exp) ? bind(mapResult(transformBinding, exp.bindings), bindings =>
                        bind(mapResult(transformCExp, exp.body), body =>
                            makeOk(makeLetExp(bindings, body)))) :
    isClassExp(exp) ? transformCExp(class2proc(exp)) :
    makeOk(exp);

const transformBinding = (b: Binding): Result<Binding> =>
    bind(transformCExp(b.val), val => makeOk(makeBinding(b.var.var, val)));





    
    