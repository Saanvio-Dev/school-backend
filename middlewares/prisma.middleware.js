// const prisma = require("@prisma/client");
// const feeService = require("../services/fee.service");

// prisma.$use(async (params, next) => {
//   if (
//     params.model === "Student" &&
//     (params.action === "update" || params.action === "create")
//   ) {
//     const studentId = params.args.data.id || params.args.where.id;
//     if (params.args.data.classId) {
//       await feeService.updateStudentFees(studentId);
//     }
//   }
//   return next(params);
// });

// module.exports = prisma;
