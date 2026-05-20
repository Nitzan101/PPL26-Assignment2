import { map } from 'ramda';
import { AppExp, AtomicExp, CExp, Exp, IfExp, isAppExp, isAtomicExp, isBoolExp, isDefineExp, isIfExp, isNumExp, isPrimOp, isProcExp, isProgram, isStrExp, isVarDecl, isVarRef, ProcExp, Program, VarDecl } from './L3/L3-ast';
import { Result, bind, makeFailure, makeOk, mapResult} from './shared/result';

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [Parsed | Error] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    isProgram(exp) ? bind(mapResult(l2ToPython, exp.exps), (exps: string[]) => makeOk(exps.join("\n"))) :
    isDefineExp(exp) ? bind(l2ToPython(exp.val), (val: string) => makeOk(`${exp.var.var} = ${val}`)) :
    isAtomicExp(exp) ? l2AtomicToPython(exp) : 
    isProcExp(exp) ? procToPython(exp) :
    isIfExp(exp) ? ifToPython(exp) : 
    isAppExp(exp) ? AppToPython(exp) :
    makeFailure("Unknown expression");

export const l2AtomicToPython = (exp : AtomicExp) : Result<string> => 
    isNumExp(exp) ? makeOk(String(exp.val)) :
    isBoolExp(exp) ? exp.val === true ? makeOk("True") : makeOk("False") : 
    isStrExp(exp) ? makeOk(exp.val) :
    isVarRef(exp) ? makeOk(exp.var) : 
    isPrimOp(exp) ? makeOk(primOpToPython(exp.op)) :
    makeFailure("Unknown atomic expression");


export const primOpToPython = (op: string): string => {
    switch (op) {
        case "=":
        case "eq?":
        case "string=?":
            return "==";
        case "number?":
            return "(lambda x: (type(x) == int or type(x) == float))";
        case "boolean?":
            return "(lambda x: (type(x) == bool))";
        default:
            return op;
    }
};

export const procToPython = (exp: ProcExp): Result<string> => {
    const varsString = map((v: VarDecl) => v.var, exp.args).join(", ");
    return bind(l2ToPython(exp.body[0]), (bodyStr: string) => 
        makeOk(`(lambda ${varsString} : ${bodyStr})`)
    );
};

export const ifToPython = (exp: IfExp): Result<string> => {
    const testResult = l2ToPython(exp.test);
    const thenResult = l2ToPython(exp.then);
    const altResult = l2ToPython(exp.alt);
    return bind(thenResult, (thenStr : string) =>
            bind(testResult, (testStr : string) =>
             bind(altResult, (altStr : string) =>
                makeOk(`(${thenStr} if ${testStr} else ${altStr})`)
            )
        )
    )
};

export const AppToPython = (exp: AppExp): Result<string> => {
    const ProcResult = l2ToPython(exp.rator);
    const randsResult = bind(mapResult(l2ToPython, exp.rands), (randsStrs: string[]) => makeOk(randsStrs.join(", ")));

    return bind(ProcResult, (procStr: string) => 
        bind(randsResult, (randsString : string) => 
            makeOk(`${procStr}(${randsString})`)
        )
    );
}