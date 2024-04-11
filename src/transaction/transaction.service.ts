import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}
  create(createTransactionDto: CreateTransactionDto, id: number) {
    const newTransaction = {
      title: createTransactionDto.title,
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      category: { id: +createTransactionDto.category },
      user: { id },
    };

    if (!newTransaction)
      throw new BadRequestException('Something went wrong...');

    return this.transactionRepository.save(newTransaction);
  }

  async findAll(id: number) {
    const transactions = await this.transactionRepository.find({
      where: { user: { id } },
      order: {
        createdAt: 'DESC',
      },
    });
    return transactions;
  }

  async findOne(id: number) {
    const transactions = await this.transactionRepository.findOne({
      where: { id },
      relations: { user: true, category: true },
    });
    if (!transactions) throw new BadRequestException('Transaction not found');
    return transactions;
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto) {
    const transactions = await this.transactionRepository.findOne({
      where: { id },
    });
    if (!transactions) throw new NotFoundException('Transaction not found');
    await this.transactionRepository.update(id, updateTransactionDto);
    return this.transactionRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const transactions = await this.transactionRepository.findOne({
      where: { id },
    });
    if (!transactions) throw new NotFoundException('Transaction not found');
    await this.transactionRepository.delete(id);

    return transactions;
  }
  async findAllWithPagination(id: number, page: number, limit: number) {
    const transactions = await this.transactionRepository.find({
      where: { user: { id } },
      // relations: { user: true, category: true },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    if (!transactions) throw new NotFoundException('Transaction not found');
    return transactions;
  }
}
