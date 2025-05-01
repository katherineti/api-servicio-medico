import { IsString, IsNotEmpty, IsOptional} from 'class-validator';

export class RoleDto{

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}