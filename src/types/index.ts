import { z } from 'zod'

export const dividaSchema = z.object({
  id: z.string().uuid().optional(),
  devedor_id: z.string().uuid(),
  valor_original: z.number().positive(),
  descricao: z.string().max(500).optional(),
  data_vencimento: z.string().optional(),
  ativa: z.boolean().default(true),
})

export const devedorSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1).max(255),
  telefone: z.string().max(20).optional(),
})

export const pagamentoSchema = z.object({
  id: z.string().uuid().optional(),
  divida_id: z.string().uuid(),
  valor: z.number().positive(),
  data_pagamento: z.string(),
})

export const tokenSchema = z.object({
  token: z.string().min(1),
  devedor_id: z.string().uuid(),
  expira_em: z.string(),
})

export type DividaInput = z.infer<typeof dividaSchema>
export type DevedorInput = z.infer<typeof devedorSchema>
export type PagamentoInput = z.infer<typeof pagamentoSchema>
