// import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

// export interface PaginationParams {
//   page: number;
//   limit: number;
// }

// @Injectable()
// export class PaginationValidationPipe implements PipeTransform<PaginationParams, PaginationParams> {
//   transform(value: PaginationParams): PaginationParams {
//     const { page, limit } = value;
    
//     if (page < 1 || limit < 1 || limit > 100) {
//       throw new BadRequestException(
//         'Page must be greater than 0 and limit must be between 1 and 100',
//       );
//     }
    
//     return value;
//   }
// } 


// DELETE THIS FILE