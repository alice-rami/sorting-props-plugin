# Плагин для сортировки атрибутов в JSX

По умолчанию сортирует атрибуты в алфавитном порядке
Задать порядок атрибутов можно в свойстве order.

### 2 специальные значения:

- **shorthand** - для краткой записи boolean-свойств (например, disabled)
- **other** - плейсхолдер для свойств, не относящихся ни к одной из указанных категорий

### Cвойства группируются по указанным префиксам

- можно указать название свойства целиком: 'key', 'className', 'size' и др.
- можно указать начальный префикс свойства до заглавной буквы, т.к. записываются в camelCase:
  - 'on' (например, для onSubmit, onMouseOver),
  - 'handle' (например, для handleClick, handleSubmit),
  - 'is' (например, isVisible, isHidden) и др.
- в качестве исключения группы свойств **aria-** и **data-** указываются с дефисом, т.к. записываются в kebab-case

### Внутри каждой группы свойства сортируются в алфавитном порядке

### Spread-оператор

- если встречается **spread-оператор** (например, {...props}), то свойства сортируются до него и после него, чтобы избежать конфликтов с переопределением значений

### Пример

```
'sort/sort-props': [
				'warn',
				{
					order: [
						'shorthand',
						'key',
						'size',
						'on',
						'handle',
						'aria-',
						'data-',
						'other',
						'className',
					],
				},
			],
```

**Без spead-оператора**

```
<Button
				disabled
				key={1}
				size='s'
				onClick={() => console.log('click')}
				onFocus={() => console.log('focus')}
				onSubmit={() => console.log('submit')}
				handleClick={() => console.log('hello')}
				color='primary'
			>
				Hello
</Button>
```

**Со spread-оператором**

```
		<Button
				disabled
				key={2}
				color='secondary'
				className={'button'}
				{...props}
				size='l'
				onClick={() => console.log('click')}
				onSubmit={() => console.log('submit')}
				handleClick={() => console.log('hello')}
			>
				Hello
			</Button>

```
