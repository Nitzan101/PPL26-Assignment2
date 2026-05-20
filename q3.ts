import { AtomicExp, Exp, isAtomicExp, isBoolExp, isNumExp, isPrimOp, isProgram, isStrExp, isVarDecl, isVarRef, Program } from './L3/L3-ast';
import { Result, bind, makeFailure, makeOk, mapResult} from './shared/result';

/*
Purpose: Transform L2 AST to Python program string
Signature: l2ToPython(l2AST)
Type: [Parsed | Error] => Result<string>
*/
export const l2ToPython = (exp: Exp | Program): Result<string>  => 
    isProgram(exp) ? makeOk() :
    
    isAtomicExp(exp) ? l2AtomicToPython(exp) : 

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